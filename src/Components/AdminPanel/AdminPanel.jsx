// src/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust the path to your Firebase initialization
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import './AdminPanel.css'; // Adjust the path to your CSS file
import OffersTab from './OffersTab'; // Adjust the path to your OffersTab component
import ProductsTab from './ProductsTab'; // Import ProductsTab component

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // Add state for active tab

  useEffect(() => {
    // Fetch users from Firestore
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        if (snapshot.empty) {
          console.log('Users collection not found or it is empty');
        } else {
          const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(usersData);
          console.log('Fetched users:', usersData); // Print fetched users to the console
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const userMessagesRef = collection(db, `users/${selectedUser}/messages`);
      const q = query(userMessagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(messagesData);
        console.log('Fetched messages for user:', selectedUser, messagesData); // Print fetched messages to the console
      });
      return () => unsubscribe();
    }
  }, [selectedUser]);

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
  };

  const handleReplySubmit = async (userId) => {
    try {
      const newReply = {
        text: replyText,
        sender: 'admin',
        read: false,
        timestamp: serverTimestamp()
      };

      const userMessagesRef = collection(db, `users/${userId}/messages`);
      await addDoc(userMessagesRef, newReply);

      setReplyText('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleClearChat = async () => {
    try {
      const userMessagesRef = collection(db, `users/${selectedUser}/messages`);
      const snapshot = await getDocs(userMessagesRef);
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteDoc(doc(db, 'users', selectedUser));
      setUsers(users.filter(user => user.id !== selectedUser));
      setSelectedUser(null);
      setMessages([]);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleClearAllUsers = async () => {
    const password = prompt('Enter the password to clear all users:');
    if (password === '12345') {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        setUsers([]);
        setSelectedUser(null);
        setMessages([]);
      } catch (error) {
        console.error('Error clearing all users:', error);
      }
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="admin-panel">
      <div className="tabs">
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
        <button onClick={() => setActiveTab('offers')} className={activeTab === 'offers' ? 'active' : ''}>Offers</button>
        <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>Products</button>
      </div>
      {activeTab === 'users' && (
        <div className="user-section">
          <div className="user-list">
            <h3>Users</h3>
            <ul>
              {users.map(user => (
                <li
                  key={user.id}
                  className={selectedUser === user.id ? 'selected' : ''}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div>{user.name} {user.username}</div>
                  <div>{user.phone}</div>
                  <div>{user.email}</div>
                </li>
              ))}
            </ul>
            <button onClick={handleClearAllUsers} className="clear-all-users-btn">Clear All Users</button>
          </div>
          <div className="chat-section-admin">
            <div className="messages-list-admin">
              <h3>Messages</h3>
              {selectedUser ? (
                messages.map(message => (
                  <div key={message.id} className="message-admin">
                    <div className="message-content-admin">
                      <p>{message.text}</p>
                      <small>{message.timestamp && message.timestamp.toDate().toLocaleString()}</small>
                    </div>
                    <div className="replies">
                      {message.replies && message.replies.map((reply, index) => (
                        <div key={index} className={`reply ${reply.sender}`}>
                          <p>{reply.text}</p>
                          <small>{reply.timestamp && reply.timestamp.toDate().toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>Select a user to view their messages</p>
              )}
            </div>
            {selectedUser && (
              <div className="reply-form">
                <textarea
                  value={replyText}
                  onChange={handleReplyChange}
                  placeholder="Reply to user..."
                />
                <button onClick={() => handleReplySubmit(selectedUser)}>Send</button>
                <button onClick={handleClearChat}>Clear Chat</button>
                <button onClick={handleDeleteUser}>Delete User</button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'offers' && <OffersTab />}
      {activeTab === 'products' && <ProductsTab />}
    </div>
  );
};

export default AdminPanel;
