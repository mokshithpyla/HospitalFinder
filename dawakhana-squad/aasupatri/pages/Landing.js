import React, { Component } from 'react';
import {Image,Switch, Text, AppRegistry, StyleSheet, View, TouchableOpacity, DrawerLayoutAndroid } from 'react-native';
//import ContactItem from '../components/ContactItem';
//import SearchItem from '../components/SearchItem';
import { Toolbar } from 'react-native-material-ui';
import { retrieveEmployeeList, retrieveSearchList, updateSearchInfo } from "../services/databaseConnection";
import _ from 'lodash';
//import { Switch } from 'react-native-gesture-handler';
//import {FeedbackElement} from './feedback'
import MenuItem from '../components/MenuItem'
const DoctorIcon = require('./../images/doctor.png');
const HospitalIcon = require('./../images/hospital.png');
const BloodIcon = require('./../images/blood.png');
const DiagnosisIcon=require('./../images/diagnose.png');
const menuIcons = {
	// myDetails: require('./../assets/images/mydetails.png'),
	// logout: require('./../assets/images/logout.png'),
	// sync: require('./../assets/images/sync.png'),
	rating: require('../images/logo.png')
}

export default class Listing extends Component {
    constructor(props) {
        super();
        this.searchEnabled = false;
        this.childFunctions = [];
        this.empList = [];
        this.state = {
            showEmpList: true,
            recentSearch: [],
            searchValue: '',
            empList: [],
            switch1Value:false,
        }
        this._getEmployeeData();
    }
    
    
    toggleSwitch1 = (value) => {
        this.setState({switch1Value: value})
        console.log('Switch 1 is: ' + value)
     }


    _getEmployeeData = () => {
        retrieveEmployeeList((list) => {
            this.empList = list;
            this.setState({
                empList: list
            });
        });
    }



    /**
     * Function to extract key
     */
    _keyExtractor = (item) => item.id || item.searchString;

    /**
     * On focus on search icon
     */
    _onFocusOfSearch = () => {
        this.searchEnabled = true;
        retrieveSearchList((list) => {
            this.setState({
                recentSearch: list.reverse(),
                showEmpList: false
            });
        });
    }

    /**
     * update the search table data
     */
    _updateTheSearchTable = () => {
        if (this.searchString) {
            let deleteItem = null, insertItem = null;
            let delete_id = _.find(this.state.recentSearch, (obj)  => {
                return obj.searchString === this.searchString;
            });
            if (!delete_id) {
                insertItem = this.searchString;
                if (this.state.recentSearch.length === 10) {
                    deleteItem = this.state.recentSearch[10]
                }
            } else {
                deleteItem = insertItem = this.searchString;
            }
            updateSearchInfo(insertItem, deleteItem);
        }
        this.searchString = null;
    }

    /**
     * On focusout of seach box
     */
    _onFocusOutOfSearch = () => {
        this._clearPrevSelection();
        this.childFunctions = [];
        this.setState({
            showEmpList: true,
            empList: this.empList
        });
        this._updateTheSearchTable();
        this.searchEnabled = false;
    }

    /**
     * on search changes
     */
    _onChangeOfSearch = (text) => {
        if (text.length) {
            this.searchString = text;
            text = text.toLowerCase();
            this.childFunctions = [];
            this.setState({
                showEmpList: true,
                empList: this.empList.filter((_) => _.name.toLowerCase().indexOf(text) !== -1)
            });
        } else {
            this.searchString = null;
            this._onFocusOfSearch();
        }
    }
    /**
     *To clear the icon selection
     */
    _clearPrevSelection = () => {
        for (let i = 0, iLen = this.childFunctions.length; i < iLen; i++) {
            this.childFunctions[i]();
        }
    }

    /**
     * History search selected.
     */
    _onSearchItemSelect = (item) => {
        this.refs.toolbar.onSearchTextChanged(item.searchString);
    }

    /**
     * History search clear icon clicked
     */
    _onClearSearchHistoryItem = (item) => {
        this.setState({
            recentSearch: this.state.recentSearch.filter((_) => _ !== item)
        });
        updateSearchInfo(null,item.searchString);
    }

    /**
     * On item selection
     */
    _onSearchItemSelectEmp = (item) => {
        this._clearPrevSelection();
        if(this.searchEnabled) {
            this.searchString = item.name;
            this._updateTheSearchTable();
        }
    }
    //------------MENU--------------
    _openCurrentDetails = () => {
		if (this.drawer) {
			this.drawer.openDrawer();
		}
		this.props.navigation.navigate('DetailsPage', this.state.currentUser
		);
    }
    _openFeedBack = () => {
		if (this.drawer) {
			this.drawer.closeDrawer();
		}
		this.props.navigation.navigate('RatingPage');
    }
    
    _logOut = () => {
		// Works on both iOS and Android
		Alert.alert(
			'Alert',
			'Are you sure you want to logout?',
			[
				{ text: 'Logout', onPress: this._handleLogout },
				{
					text: 'Get Back', onPress: () => {
						if (this.drawer) {
							this.drawer.closeDrawer();
						}
					}
				}
			],
			{ cancelable: false }
		)
    }
    _handleLogout = () => {
		clearDataBase();
		this.props.navigation.dispatch(NavigationActions.reset(
			{
				index: 0,
				actions: [
					NavigationActions.navigate({ routeName: 'Home' })
				]
			}
		));
	}
	 //------------MENU--------------

	_continueToDoctorsList=()=>{
		this.props.navigation.navigate('DoctorsList');
    }
    _continueToHospitalMap=()=>{
        this.props.navigation.navigate('HospitalMap');
    }
    _continueToHospitalsList=()=>{
        this.props.navigation.navigate('HospitalsList');
    }
    _continueToBloodBank=()=>{
        this.props.navigation.navigate('BloodBank');
    }
    _continueToDiagnosis=()=>{
        this.props.navigation.navigate('Diagnosis');
    }
    _renderMenuItems = () => {
		return (
			<View style={styles.menuContainer}>
				<View style={styles.menuList}>
					{/* <MenuItem
						title={'My details'}
						icon={menuIcons.myDetails}
						onPress={this._openCurrentDetails}
					/> */}
					<MenuItem
						title={'Send Feedback'}
						icon={menuIcons.feedback}
						onPress={this._openFeedBack}
					/>
					<MenuItem
						title={'Logout'}
						icon={menuIcons.logout}
						onPress={this._logOut}
					/>
				</View>
			</View>
		);
    }
    _pageBody = () => {
		return (
            <View>
            <Text style={styles.mainHeading}>Asupathri</Text>
            <View style={styles.rowStyle3}>
                 <Text style={{fontWeight:'bold'}}>Willing to Donate Blood?</Text>
                 <Switch
                 style={styles.switch}
                 value={this.state.switch1Value}
                 onValueChange={(val) => this.setState({switch1Value:val})}
 
                 />  
                 </View>
                 <View style={styles.rowStyle}>
                     <View style={[styles.colStyle, styles.colLeftStyle]}>
                         <TouchableOpacity style={styles.colDataStyle} onPress={this._continueToDoctorsList}>
                             <Image style={styles.ImageStyle}
                                 source={DoctorIcon}/>
                                 <Text style={styles.TextStyle}>Need a Doctor?</Text>
                             
                     </TouchableOpacity>
                     </View>
                     <View style={[styles.colStyle, styles.colRightStyle]}>
                         <TouchableOpacity style={styles.colDataStyle} onPress={this._continueToHospitalMap}>
                             
                             <Image style={styles.ImageStyle}
                                 source={HospitalIcon}/>
                                 <Text style={styles.TextStyle}>Search Hospitals</Text>
 
                         </TouchableOpacity>
                     </View>
                 </View>
                 <View style={styles.rowStyle}>
                         <TouchableOpacity style={styles.colDataStyle} onPress={this._continueToBloodBank}>
                             <View style={[styles.colStyle, styles.colLeftStyle]}>
                             <Image style={styles.ImageStyle1}
                                 source={BloodIcon}/>
                             </View>    
                             <View style={[styles.colStyle, styles.colRightStyle]}>  
                               <Text style={styles.TextStyle1}>Blood Availability</Text>
                             </View>
                         </TouchableOpacity>
                 </View>
                 <View style={styles.rowStyle4}>
                         <TouchableOpacity style={styles.colDataStyle} onPress={this._continueToDiagnosis}>
                             <View style={[styles.colStyle, styles.colLeftStyle]}>
                             <Image style={styles.ImageStyle1}
                                 source={DiagnosisIcon}/>
                             </View>    
                             <View style={[styles.colStyle, styles.colRightStyle]}>  
                               <Text style={styles.TextStyle1}>Diagnosis</Text>
                             </View>
                         </TouchableOpacity>
                 </View>
                 </View>
		);

	}
    render() {
        return (
            <View style={styles.container}>
            <DrawerLayoutAndroid
                drawerWidth={200}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                renderNavigationView={this._renderMenuItems}
                ref={(dra) => { !this.drawer ? this.drawer = dra : null }}
                    
			>
                {this._pageBody()}
			</DrawerLayoutAndroid>
            </View>
            );
    }
}




            //      centerElement="Asupathri"
            //      ref="toolbar"
            //      searchable={{
            //          autoFocus: true,
            //          placeholder: 'Search',
            //          onSearchPressed: this._onFocusOfSearch,
            //          onSearchClosed: this._onFocusOutOfSearch,
            //          onChangeText: this._onChangeOfSearch
            //      }}
            //  />
            //  {this.state.showEmpList ?
            //      <FlatList
            //          data={this.state.empList}
            //          keyExtractor={this._keyExtractor}
            //          renderItem={({ item }) =>
            //              <ContactItem navigation={this.props.navigation}
            //                  data={item}
            //                  onItemSelect={this._onSearchItemSelectEmp}
            //                  ref={(ref) => { ref && this.childFunctions.push(ref._clearSelection) }}
            //              />
            //          }
            //      />
            //      :
            //      <FlatList
            //          data={this.state.recentSearch}
            //          keyExtractor={this._keyExtractor}
            //          renderItem={({ item }) =>
            //              <SearchItem onItemSelect={this._onSearchItemSelect}
            //                  onClearItem={this._onClearSearchHistoryItem}
            //                  data={item}
            //              />}
            //      />
            //  }
            // </View>

const styles = StyleSheet.create({
    // menuContainer: {
	// 	flex: 1,
    //     backgroundColor: '#0080d1',
    
    // },
    // menuList: {
    //     flex: 1,
    //     height:100,
	// 	marginTop: 150
	// },
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    rowStyle: {
        flexDirection: 'row',
        height: 150,
        marginTop:30,
        marginRight:30,
        marginLeft:30,
    },
    rowStyle1: {
        height: 150,
        marginTop:30,
        marginRight:30,
        marginLeft:30,
        flexDirection:'row', 
        flexWrap:'wrap'
    },
    rowStyle2: {
        height: 100,
        marginTop:30,
        paddingBottom:20,
        marginRight:30,
        marginLeft:30,
        flexDirection:'row', 
        flexWrap:'wrap'
    },
    rowStyle3: {
        //height: 100,
        marginTop:30,
        marginRight:30,
        marginLeft:30,
        flexDirection:'row', 
        flexWrap:'wrap'
    },
    rowStyle4: {
        height: 130,
        marginTop:30,
        marginRight:30,
        marginLeft:30,
        flexDirection:'row', 
        flexWrap:'wrap'
    },
    
    colStyle: {
        flex :1,
        // paddingTop: 40,
        // paddingBottom: 40
    },
    colLeftStyle: {
        //marginLeft:15,
        marginRight:30,
        // paddingLeft: 40,
        // paddingRight: 20
    },
    colRigtStyle: {
        marginLeft:30,
        //marginRight:15,
        
        // paddingLeft: 20,
        // paddingRight: 40
    },
    colDataStyle :{
        backgroundColor: '#0080d1',
        flex: 1,
        borderRadius:10,
    },
    

    ImageStyle:{
        height:70,
        width:70,
        marginTop:20,
        marginLeft:30,
       // alignContent:'center',
        resizeMode:'center'
    },

    ImageStyle1:{
        height:70,
        width:70,
        marginTop:40,
        marginLeft:30,
        alignContent:'center',
        resizeMode:'center',
        // paddingBottom:50,
       

    }, 

    TextStyle:{
        marginTop:20,
        marginLeft:10,
        fontSize: 15,
        fontWeight: 'bold',
        
        color:'white',
        alignContent:'center',
        justifyContent:'center',

    },
    TextStyle1:{
        marginTop: -10, 
        marginLeft:130,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        alignContent:'center',
        //color:'white',     
        // marginBottom: 80

    },
    TextStyle2:{
        marginTop: 18, 
        marginLeft:120,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        alignContent:'center',
        //color:'white',     
        // marginBottom: 80

    },
    TextStyle3:{
        //marginTop: 40, 
        marginRight:120,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        //alignContent:'center',
        //color:'white',     
        // marginBottom: 80

    },
    switch:{
        marginTop:0,
        marginRight:0,
        marginLeft:150,
        
    },
    mainHeading: {
        paddingTop:10,
        paddingLeft:90,
        fontSize: 40,
        color: '#0080d1'
    },
    
});

AppRegistry.registerComponent('LandingPage', () => LandingPage);