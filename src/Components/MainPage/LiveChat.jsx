import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc,getDoc,setDoc, addDoc, serverTimestamp, onSnapshot, query, orderBy ,updateDoc} from 'firebase/firestore';
import Cookies from 'js-cookie';
function LiveChat() {
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
  
    const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    phone: '',
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [userId, setUserId] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  useEffect(() => {
    const storedUserId = Cookies.get('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchPreviousMessages(storedUserId);
    }
  }, []);
  
  useEffect(() => {
    if (userId) {
      const userMessagesCollection = collection(db, `users/${userId}/messages`);
      const q = query(userMessagesCollection, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => doc.data());
        setMessages(fetchedMessages);
  
        if (!isOpen) {
          const newUnreadMessages = fetchedMessages.filter(msg => !msg.read && msg.sender === 'admin').length;
          setUnreadMessages(newUnreadMessages);
        }
      });
      return () => unsubscribe();
    }
  }, [userId, isOpen]);
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);
  
  const toggleChat = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadMessages(0);
      if (userId) {
        const userMessagesCollection = collection(db, `users/${userId}/messages`);
        const q = query(userMessagesCollection, orderBy('timestamp'));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(async (doc) => {
          if (!doc.data().read && doc.data().sender === 'admin') {
            await updateDoc(doc.ref, { read: true });
          }
        });
      }
    } else if ( !userId) {
      setMessages([
        { text: 'Merhaba daha kolay iletişim için aşağıdaki bilgileri doldurunuz', sender: 'bot' }
      ]);
    }
  };
  
  const fetchPreviousMessages = async (userId) => {
    const userMessagesCollection = collection(db, `users/${userId}/messages`);
    const q = query(userMessagesCollection, orderBy('timestamp'));
    const snapshot = await getDocs(q);
    const fetchedMessages = snapshot.docs.map(doc => doc.data());
    setMessages(fetchedMessages);
  };
  
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newUserId = `${formData.phone}-${formData.name.split(' ').pop()}`; // Generate unique user ID
    const userDocRef = doc(db, `users/${newUserId}`);
    const newMessages = [
      { text: `Teşekkürler! ${formData.name}, Sizlere en kısa sürede yanıt verilecektir.`, sender: 'bot', timestamp: serverTimestamp(), read: false },
    ];
  
    try {
      // Check if user exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // Create user document
        await setDoc(userDocRef, {
          email: formData.email,
          name: formData.name,
          username: formData.username,
          phone: formData.phone,
          createdAt: serverTimestamp(),
        });
      }
  
      // Save messages to Firestore in the user's collection
      const userMessagesCollection = collection(userDocRef, 'messages');
      for (const msg of newMessages) {
        await addDoc(userMessagesCollection, msg);
      }
  
      // Save user ID in cookies
      Cookies.set('userId', newUserId, { expires: 365 }); // Cookie expires in 1 year
      setUserId(newUserId);
  
      setMessages((prevMessages) => [
        ...prevMessages,
        ...newMessages,
      ]);
      setIsFormSubmitted(true);
    } catch (error) {
      console.error("Error saving messages to Firestore:", error);
    }
  };
  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && userId) {
      const userDocRef = doc(db, `users/${userId}`);
  
      const userMessage = { text: input, sender: 'user', timestamp: serverTimestamp(), read: true };
  
      try {
        // Save user message to Firestore
        const userMessagesCollection = collection(userDocRef, 'messages');
        await addDoc(userMessagesCollection, userMessage);
        setInput('');
  
        // Generate bot response
  
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
    <div className="chat-header" onClick={toggleChat}>
      <span>{isOpen ? '7/24 Destek' : 'Chat'}</span>
      <span className="icon">💬</span>
      {unreadMessages > 0 && (
        <span className="unread-count">{unreadMessages}</span>
      )}
    </div>
    {isOpen && (
      <div className="chat-body">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <span className="message-icon">
                {msg.sender === 'admin' && '👨‍💼'}
                {msg.sender === 'user' && '🧑‍🚀'}
                {msg.sender === 'bot' && '🤖'}
              </span>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {userId ? (
          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="mesaj yaz..."
            />
            <button type="submit">Gönder</button>
          </form>
        ) : (
          <form className="info-form" onSubmit={handleFormSubmit}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="E-posta"
              required
            />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Isim"
              required
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              placeholder="Soyisim"
              required
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="Telefon No"
              required
            />
            <button type="submit">Gönder</button>
          </form>
        )}
      </div>
    )}
   
  </div>
  )
}

export default LiveChat