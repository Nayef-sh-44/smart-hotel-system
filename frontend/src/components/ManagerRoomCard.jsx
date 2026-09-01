import React, { useState } from 'react';
import { Trash2, Image as ImageIcon, Check, X } from 'lucide-react';
import { managerService } from '../services/api.js';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils.js';

export default function ManagerRoomCard({ room, onRoomUpdated, onDelete }) {
  const [status, setStatus] = useState(room.status || 'available');
  const [availableRooms, setAvailableRooms] = useState(room.available_rooms);
  const [isUpdating, setIsUpdating] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const res = await managerService.updateRoomStatus(room.id, newStatus);
      if (res.success) {
        setStatus(newStatus);
        toast.success('Status updated');
        onRoomUpdated();
      }
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAvailable = async () => {
    setIsUpdating(true);
    try {
      const res = await managerService.updateRoomAvailability(room.id, parseInt(availableRooms));
      if (res.success) {
        toast.success('Availability updated');
        onRoomUpdated();
      }
    } catch (e) {
      toast.error('Failed to update availability');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('image', imageFile);
    setUploadingImage(true);
    try {
      const res = await managerService.uploadRoomImage(room.id, formData);
      if (res.success) {
        toast.success('Room image uploaded');
        setImageFile(null);
        onRoomUpdated();
      }
    } catch (e) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const res = await managerService.deleteRoomImage(room.id, imageId);
      if (res.success) {
        toast.success('Image deleted');
        onRoomUpdated();
      }
    } catch (e) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className={`glass-card p-6 flex flex-col justify-between border-2 ${status === 'unavailable' ? 'border-red-500/20 opacity-80' : 'border-transparent'}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/30 capitalize font-bold text-sm">
            {room.room_type} Suite
          </span>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 p-1 rounded">
            Capacity: {room.capacity}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <div className="flex gap-2">
              <button 
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('available')}
                className={`px-3 py-1 text-xs font-bold rounded flex-1 ${status === 'available' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
              >
                Available
              </button>
              <button 
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('unavailable')}
                className={`px-3 py-1 text-xs font-bold rounded flex-1 ${status === 'unavailable' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}
              >
                Unavailable
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-500">Available Rooms:</span>
            <div className="flex gap-2">
              <input 
                type="number" 
                min="0"
                value={availableRooms} 
                onChange={(e) => setAvailableRooms(e.target.value)}
                className="input-field text-sm p-1 w-20 text-center"
              />
              <button onClick={handleSaveAvailable} disabled={isUpdating || availableRooms === room.available_rooms} className="px-3 py-1 bg-brand-100 text-brand-700 rounded text-xs font-bold hover:bg-brand-200 disabled:opacity-50">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Rate</span>
          <p className="text-lg font-bold text-slate-900">USD {room.price_per_night}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setImageModalOpen(true)} className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1">
            <ImageIcon className="w-4 h-4" /> Images ({room.images?.length || 0})
          </button>
          <button onClick={() => onDelete(room.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {imageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Room Images: {room.room_type} Suite</h3>
              <button onClick={() => setImageModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 mb-6 items-center">
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field text-sm" />
              <button onClick={handleUploadImage} disabled={uploadingImage || !imageFile} className="btn-primary px-6 py-2 rounded-xl shrink-0">
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {room.images && room.images.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <img src={getImageUrl(img.image_url)} alt="Room" className="w-full h-32 object-cover" />
                  <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!room.images || room.images.length === 0) && (
                <p className="col-span-full text-center text-slate-500 py-8">No images uploaded for this room yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
