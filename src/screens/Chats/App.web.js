// ==================== CHAT ROOM SCREEN (with Socket.io) ====================
function ChatRoomScreen({ route, navigation }) {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      
      // Connect socket
      const newSocket = connectSocket(parsed.id);
      setSocket(newSocket);
      
      // Listen for new messages
      newSocket.on('newMessage', (message) => {
        if (message.chat_id === chatId) {
          setMessages(prev => [...prev, message]);
        }
      });
      
      // Listen for typing
      newSocket.on('userTyping', (data) => {
        if (data.chatId === chatId && data.userId !== parsed.id) {
          console.log(`${data.name} is typing...`);
        }
      });
    }
    
    loadMessages();
    
    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('userTyping');
      }
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.log('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;

    const messageData = {
      chatId: chatId,
      senderId: user.id,
      type: 'text',
      content: messageText,
    };

    try {
      // Send via REST API
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });
      
      const newMessage = await response.json();
      if (response.ok) {
        setMessages([...messages, newMessage]);
        setMessageText('');
      }
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && user) {
      socket.emit('typing', {
        chatId: chatId,
        userId: user.id,
        name: user.name,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Room</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View 
            style={[
              styles.messageBubble,
              item.sender_id === user?.id 
                ? styles.myMessage 
                : styles.otherMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              item.sender_id === user?.id 
                ? styles.myMessageText 
                : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
          </View>
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          onKeyPress={handleTyping}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
                   }
