import React from 'react';
import './OnlineUsersList.css';

const OnlineUsersList = ({ users = [] }) => {
  return (
    <div className="online-users-container">
      <h3 className="online-users-title">
        Online Users <span className="user-count">({users.length})</span>
      </h3>
      <div className="users-list">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.userId || user._id} className="user-item">
              <span className="user-status-dot"></span>
              <span className="user-name">{user.username}</span>
            </div>
          ))
        ) : (
          <p className="no-users">No users online</p>
        )}
      </div>
    </div>
  );
};

export default OnlineUsersList;
