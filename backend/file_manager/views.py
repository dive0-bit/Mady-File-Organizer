import os
import shutil
from collections import deque
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FileIndex

CATEGORIES = {
    "Small_Files": 1024 * 1024,
    "Medium_Files": 50 * 1024 * 1024,
}

@api_view(['POST'])
def organize_files(request):
    target_dir = request.data.get('folder_path')
    
    if not target_dir or not os.path.exists(target_dir):
        return Response({"error": "Boss, either this path is wrong or it doesn't exist!"}, status=400)

    # 1. SEARCH & QUEUE ALGORITHM
    file_queue = deque()
    for root, _, files in os.walk(target_dir):
        if any(cat in root for cat in ["Small_Files", "Medium_Files", "Large_Files"]):
            continue
        for file in files:
            file_queue.append(os.path.join(root, file))

    organized_list = []
    
    # 2. DEQUEUE & ORGANIZE
    for cat in ["Small_Files", "Medium_Files", "Large_Files"]:
        os.makedirs(os.path.join(target_dir, cat), exist_ok=True)

    while file_queue:
        file_path = file_queue.popleft()
        file_name = os.path.basename(file_path)
        size = os.path.getsize(file_path)
        
        dest_folder = "Large_Files"
        if size < CATEGORIES["Small_Files"]:
            dest_folder = "Small_Files"
        elif size < CATEGORIES["Medium_Files"]:
            dest_folder = "Medium_Files"
            
        dest_path = os.path.join(target_dir, dest_folder, file_name)
        shutil.move(file_path, dest_path)
        
        # 3. HASHMAP INDEXING (Save original & new path)
        FileIndex.objects.update_or_create(
            name=file_name,
            defaults={'original_path': file_path, 'current_path': dest_path, 'category': dest_folder}
        )
        organized_list.append({"name": file_name, "category": dest_folder})

    # 4. SMART RESPONSE LOGIC
    if len(organized_list) == 0:
        already_organized = any(os.path.exists(os.path.join(target_dir, cat)) for cat in ["Small_Files", "Medium_Files", "Large_Files"])
        
        if already_organized:
            return Response({
                "message": "Mady: Boss, this folder is already organized! I didn't find any new scattered files ",
                "files_data": []
            })
        else:
            return Response({
                "message": "Mady: Boss, there aren't any files in this folder",
                "files_data": []
            })

    return Response({
        "message": f"Mady: I found and organized {len(organized_list)} files! Boss.. Is there anything to do?",
        "files_data": organized_list
    })

@api_view(['GET'])
def retrieve_file(request):
    file_name = request.GET.get('filename')
    file_record = FileIndex.objects.filter(name=file_name).first() # O(1) Search via DB Hash Index
    
    if file_record:
        return Response({"message": f"Boss: Found it instantly! Current Path: {file_record.current_path}", "found": True})
    return Response({"message": "Boss: Sorry, that file doesn't exist in my index.", "found": False})

@api_view(['POST'])
def restore_file(request):
    file_name = request.data.get('filename')
    file_record = FileIndex.objects.filter(name=file_name).first()
    
    if file_record and os.path.exists(file_record.current_path):
        # Move back to original location
        shutil.move(file_record.current_path, file_record.original_path)
        # Update our "HashMap"
        file_record.current_path = file_record.original_path
        file_record.save()
        return Response({"message": f"Mady: Done Boss! I put the '{file_name}' back in its original place"})
    
    return Response({"error": "Boss, file hasn't been opened, seems like it has already been moved"})