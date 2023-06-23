import {
  Text,
  View,
  PermissionsAndroid,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import React, {Component} from 'react';
const {height, width} = Dimensions.get('window');

import Geolocation from '@react-native-community/geolocation';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

import cold from '../assets/images/cold.png';
import blue from '../assets/images/blue.png';
import cloudy from '../assets/images/cloudy.png';
import orange from '../assets/images/orange.png';
import rainny from '../assets/images/rainny.png';

interface IState{
  latitude:string,
  longitude:string,
  temparature:string,
  city:string,
  state:string,
  country:string,
  weatherCondition:string,
  search:string
}

export default class Home extends Component<IState> {
  state = {
    latitude: '',
    longitude: '',
    temparature: '',
    city: '',
    state: '',
    country: '',
    weatherCondition: '',
    search: '',
  };

  componentDidMount() {
    this.getLattidueLongitude();
  }

  getLattidueLongitude = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permissions',
          message: 'access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      // success
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(info =>
          this.setState(
            {
              latitude: info.coords.latitude,
              longitude: info.coords.longitude,
            },
            () => this.getLocationName(),
          ),
        );
        console.log('You can use the location');
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  getWeatherReport = async (place:string) => {
    const {latitude, longitude} = this.state;
    const lat = latitude[2];
    const long = longitude[2];
    const url = `http://api.weatherapi.com/v1/current.json?key=210bfdbec78446e885070131232006&q=${place}`;
    await fetch(url)
      .then(response => response.json())
      .then(response => {
        const temp = response.current.temp_c;
        this.setState({
          temparature: temp,
          state: response.location.region,
          country: response.location.country,
          city: response.location.name,
          weatherCondition: response.current.condition.text,
        });
      }).
      catch(error => {
        Alert.alert("Invalid Location")
      })
  };

  getLocationName = async () => {
    const {latitude, longitude, city} = this.state;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=c96a409603cb4498be0868bfd9774c7f`;
    await fetch(url)
      .then(response => response.json())
      .then(response => {
        this.setState({city: response.results[0].components.city}, () =>
          this.getWeatherReport(this.state.city),
        );
      });
  };

  handleSearch = () => {
    if (this.state.search != '') {
      this.getWeatherReport(this.state.search);
      Keyboard.dismiss();
      this.setState({search: ''});
    }
  };

  render() {
    const {city, temparature, weatherCondition, state, country} = this.state;
    console.log(temparature);
    let temp = parseInt(temparature);
    // let temp = 32;
    let highTemp = temp + 3;
    let lowTemp = temp - 3;
    let background;
    if (temp < 0) {
      background = cold;
    } else if (temp >= 0 && temp <= 20) {
      background = rainny;
    } else if (temp > 20 && temp <= 27) {
      background = cloudy;
    } else if (temp > 27 && temp <= 29) {
      background = orange;
    } else {
      background = blue;
    }

    return (
      <View style={styles.mainContainer}>
        <ImageBackground
          style={styles.backgroundImage}
          resizeMode="cover"
          source={background}>
          <View>
            {!temp ? (
              <View style={styles.activityContainer}>
                <ActivityIndicator color={'white'} size={50} />
              </View>
            ) : (
              <View style={styles.weatherContainer}>
                <View style={styles.tempContainer}>
                  <Text style={styles.tempText}>{temp}</Text>
                  <MaterialCommunityIcons
                    name="temperature-celsius"
                    size={55}
                    color={'white'}
                  />
                  <View>
                    <Text style={styles.highText}>H : {highTemp} ํ</Text>
                    <Text style={styles.highText}>L : {lowTemp} ํ</Text>
                  </View>
                </View>
                <View style={styles.placeContainer}>
                  <Entypo name="location-pin" size={25} color={'white'} />
                  <Text style={styles.locationText}>
                    {city}, {state}, {country}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TextInput
              value={this.state.search}
              onChangeText={text =>
                this.setState({search: text.toLocaleLowerCase().trim()})
              }
              placeholder="Search Location"
              style={styles.input}
            />
            <TouchableOpacity
              onPress={this.handleSearch}
              style={styles.searchButton}>
              <Text style={styles.searchText}>Search</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
  },
  weatherContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    top: 100,
    right: 20,
  },
  activityContainer:{
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    top: 120,
    right: 70,
  },
  tempText: {
    fontSize: 45,
    fontWeight: '600',
    color: 'white',
  },
  highText: {
    color: 'white',
    marginBottom: 5,
    fontSize: 13,
    marginLeft: 13,
  },
  locationText: {
    color: 'white',
    fontSize: 14,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '',
  },
  input: {
    marginTop: 140,
    width: 300,
    borderRadius: 15,
    paddingHorizontal: 10,
    borderColor: '#c9c8c3',
    backgroundColor: '#e4e7eb',
    borderWidth: 1,
  },
  mainContainer: {
    height: height,
  },
  searchButton: {
    backgroundColor: '#03325c',
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  searchText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
