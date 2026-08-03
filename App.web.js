// In App.web.js, replace the ChatsScreen import with:
import TabNavigator from './src/navigation/TabNavigator';

// Then in the Stack Navigator, replace:
<Stack.Screen name="Chats" component={ChatsScreen} />

// With:
<Stack.Screen name="Chats" component={TabNavigator} />
