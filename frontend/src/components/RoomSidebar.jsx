import React, { useState } from 'react';
import { roomService } from '../services/api';
import './RoomSidebar.css';

const RoomSidebar = ({ rooms, currentRoom, onSelectRoom, onCreateRoom }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setIsLoading(true);
    try {
      const response = await roomService.createRoom(newRoomName, newRoomDesc);
      onCreateRoom(response.data);
      setNewRoomName('');
      setNewRoomDesc('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert(error.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="room-sidebar">
      <div className="sidebar-header">
        <h2>Chat Rooms</h2>
        <button
          className="create-room-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Create new room"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form className="create-room-form" onSubmit={handleCreateRoom}>
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            maxLength="50"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newRoomDesc}
            onChange={(e) => setNewRoomDesc(e.target.value)}
            maxLength="500"
          />
          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowCreateForm(false);
                setNewRoomName('');
                setNewRoomDesc('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room._id}
              className={`room-item ${currentRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="room-info">
                <h4 className="room-name">{room.name}</h4>
                {room.description && (
                  <p className="room-description">{room.description}</p>
                )}
              </div>
              {room.messageCount > 0 && (
                <span className="message-count">{room.messageCount}</span>
              )}
            </div>
          ))
        ) : (
          <p className="no-rooms">No rooms available</p>
        )}
      </div>
    </div>
  );
};

export default RoomSidebar;
