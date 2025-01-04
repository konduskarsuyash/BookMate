import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const DrawerMenu = ({ onClose }) => {
  const [slideAnim] = useState(new Animated.Value(-Dimensions.get('window').width));

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <Animated.View 
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleClose}
            style={styles.closeButton}
          >
            <Icon name="x" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.profile}>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Melody Davison</Text>
            <Text style={styles.handle}>@melodydavison</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="home" size={28} color="#4A5568" />
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="info" size={28} color="#4A5568" />
            <Text style={styles.menuText}>About</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.suggestButton}>
          <Text style={styles.suggestButtonText}>Suggest a New Book</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>BookMate</Text>
          <Text style={styles.footerSubtitle}>Book Review App v1.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    flex: 1,
    width: '85%',
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 4,
  },
  profile: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  profileInfo: {
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  handle: {
    fontSize: 16,
    color: '#718096',
  },
  menu: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 18,
    color: '#4A5568',
    marginLeft: 20,
    flex: 1,
  },
  flag: {
    width: 28,
    height: 20,
  },
  suggestButton: {
    backgroundColor: '#4C1D95',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  suggestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 16,
    color: '#718096',
  },
});

export default DrawerMenu;

