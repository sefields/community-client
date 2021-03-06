import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, SubmissionError} from 'redux-form';
import AddressMap from './AddressMap.jsx';
import '../../static/css/AddressForm.css';

class Form extends Component {
  constructor(props){
    super(props);
    this.submit = this.submit.bind(this);
    this.setAddressInputRef = this.setAddressInputRef.bind(this);
    this.addressField = this.addressField.bind(this);
    this.setLocation = this.setLocation.bind(this);
    this.geocodeAddress = this.geocodeAddress.bind(this);

    this.google = window.google;

    this.state = {
      currentLocation: this.props.initialCenter,
      formSuccess: false,
      formError: false
    };
  }

  componentDidMount(){
    if(!this.props.hasStation[this.props.formType]){
      this.props.change("type", this.props.formType);
      if(navigator && navigator.geolocation){
        navigator.geolocation.getCurrentPosition((pos)=>{
          const coords = pos.coords;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude
            }
          });
        });
      }
      this.initMap();
    }
  }

  initMap(){
    const maps = this.google.maps;


    this.autocomplete = new maps.places.Autocomplete(this.addressInput, {types: ['geocode']});
    this.autocomplete.addListener('place_changed', this.setLocation);

    this.geocoder = new maps.Geocoder();
  }

  setLocation(){
    let place = this.autocomplete.getPlace();
    //this.props.form["station-form"].values.address = place.formatted_address;
    this.props.change('address', place.formatted_address);

    if(!place.formatted_address){
      return;
    }

    this.geocodeAddress(place.formatted_address);
  }

  geocodeAddress(address){
    console.log(address);
    this.geocoder.geocode({'address':address}, (results, status) => {
      if(status == 'OK'){
        let lat = results[0].geometry.location.lat();
        let lng = results[0].geometry.location.lng();
        this.setState({
          currentLocation:{
            lat:lat,
            lng:lng
          }
        });
        this.props.change('lat', lat);
        this.props.change('lng', lng);
        this.props.change('type', this.props.formType);
      } else {
        console.log("Error finding address");
        this.setState({
          currentLocation: this.props.errorCenter
        });
      }
    });
  }

  submit(values){
    return new Promise((resolve, reject) => {
      //dispatch action
      this.props.submitStationForm({values, resolve, reject});
    }).then((res) => {
      console.log("RESOLVED SUBMIT");
      this.props.reset(); //clear the form
      this.setState({
        formSuccess: true,
        formError: false
      });
      setTimeout(()=>{
        this.setState({
          formSuccess: false
        });
      }, 1500);

      if(window.ga){
        console.log("SEND GA SUBMIT FORM", this.props.formType);
        window.ga('send', {
          hitType: 'event',
          eventCategory: 'Bounty',
          eventAction: 'add-station',
          eventLabel: this.props.formType
        });
      }

    }).catch(error => {
      //throw new SubmissionError(error);
      this.setState({
        formError: true
      });
    });
  }

  setAddressInputRef(inputRef){
    this.addressInput = inputRef;
  }

  errorField({input,label, meta: {touched, error}, ...custom}){
    const hasError = touched && error !== undefined;
    console.log(error);
    return(
      <div className="form-error">
        {hasError && "Please fill in all the fields"}
      </div>
    );
  }

  hiddenField({input, meta: {touched, error},...custom}){
    return(
      <div>
        <input type="hidden" {...input} {...custom}/>
      </div>
    );
  }

  addressField({input, label, meta:{touched, error}, ...custom}){
    return(
      <div>
        <input className="form-control" ref={this.setAddressInputRef} type="text" {...input} {...custom} placeholder={label}/>
      </div>
    );
  }

  handleKeyDown(e){
    if(e.key=='Enter' && e.shiftKey === false){
      e.preventDefault();
    }
  }

  render(){

    let extraFields = null;
    switch(this.props.formType){
    case "mailbox":
      extraFields = (
        <div>
          <label htmlFor="ped">Public pedestrian access can be provided?&nbsp;&nbsp;</label>
          <Field name="pedestrianAccess" id="ped" component="input" type="checkbox" />
        </div>);
      break;
    case "driveway":
      extraFields = (
        <div>
          <label htmlFor="drive">Land access from public road can be provided?&nbsp;&nbsp;</label>
          <Field name="drivewayAccess" id="drive" component="input" type="checkbox" />
        </div>);
      break;
    }

    let show = true;

    if(this.props.hasStation[this.props.formType]){
      show = false;
    }

    let form = null;

    if(show){
      form = (
        <div>
          <div className="row">
            <div className="col-md-6 ml-auto">
              <FormDescription formType={this.props.formType} />
            </div>
            <div className="col-md-3"></div>
          </div>
          <div className="row">
            <div id="form-wrapper" className="col-md-4 ml-auto">
              <form onSubmit={this.props.handleSubmit(this.submit)} onKeyDown={(e) => { this.handleKeyDown(e);}}>
                <div>
                  <label>Address</label>
                  <Field name="address" component={this.addressField} label="Enter Address"/>
                </div>
                <Field name="lat" component={this.hiddenField} />
                <Field name="lng" component={this.hiddenField} />
                <Field name="type" component={this.hiddenField} value={this.props.formType}/>
                <AddressMap center={this.state.currentLocation} />
                <div>
                  <label>Is this a business or private residence?</label>
                  <Field name="residenceType" className="form-control" component="select">
                    <option value="">Please select one</option>
                    <option value="Private">Private Residence</option>
                    <option value="Business">Business Residence</option>
                  </Field>
                </div>
                <div>
                  <label>Nearest electrical outlet</label>
                  <Field name="electricalOutlet" className="form-control" component="select">
                    <option value="">Please select one</option>
                    <option value="<10m">Less than 10m</option>
                    <option value="10-20">10m to 20m</option>
                    <option value=">20m">More than 20m</option>
                    <option value="none">No available outlet nearby</option>
                  </Field>
                </div>
                {extraFields}
                <Field name="error" component={this.errorField} />
                <div className="form-error">{(this.state.formError ? "Error submitting. Please try again." : null)}</div>
                <div className="text-center>">
                  <button type="submit" disabled={this.props.submitting} className="btn btn-custom">{(this.state.formSuccess ? "Thanks!" : "Sign Up")}</button>
                </div>
              </form>
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      );
    } else {
      form = <FormSuccess formType={this.props.formType} />;
    }


    return(
      <div>
        {form}
      </div>
    );
  }
}

class FormSuccess extends Component {
  constructor(props){
    super(props);
  }

  render(){
    let imgSrc = `../../static/images/${this.props.formType}.png`;
    return(
      <div className="row">
        <div className="col-md-6 ml-auto text-center">
          <img className="form-success-img" src={imgSrc}/>
          <h2>Thank you!</h2>
          <p>We have received your message and will be in touch.</p>
        </div>
        <div className="col-md-3"></div>
      </div>
    );
  }
}

class FormDescription extends Component {
  constructor(props){
    super(props);
  }

  render(){
    let para = "";
    switch(this.props.formType){
    case "backyard":
      para = `If your home has a yard, and you would like to find out how you can earn money by placing a charging station in it, sign up below and we will get back to you with more details.`;
      break;
    case "roof":
      para = `If you have access to your home's roof, and you would like to find out how you can earn money by placing a charging station on it, sign up below and we will get back to you with more details.`;
      break;
    case "mailbox":
      para = `If your home has an open area, that is accessible to the street, and you would like to find out how you can earn money by placing a mailbox on it, sign up below and we will get back to you with more details.`;
      break;
    case "driveway":
      para = 'If your home has a driveway, and you would like to find out how you can earn money by allowing autonomous vehicles to park and charge there, sign up below and we will get back to you with more details.';
      break;
    default:
      para="";
    }

    return(
      <p className="text-center">{para}</p>
    );
  }
}

export const validate = (values) => {
  const errors = {};
  errors.error = '';
  if(!values.address || values.address.trim() == ''){
    errors.error += 'Address Required '; // name should be same as form field name
  }

  if(!values.residenceType || values.residenceType.trim() == ''){
    errors.error += 'Residence type needed ';
  }

  if(!values.electricalOutlet || values.electricalOutlet.trim() == ''){
    errors.error += 'Electrical outlet needed ';
  }

  return errors;
};

Form.propTypes = {
  handleSubmit : PropTypes.func,
  submitting: PropTypes.bool,
  change: PropTypes.func,
  formType: PropTypes.string,
  hasStation: PropTypes.object,
  submitStationForm: PropTypes.func,
  reset: PropTypes.func,
  initialCenter:PropTypes.object,
  errorCenter: PropTypes.object,
  success: PropTypes.bool
};

FormSuccess.propTypes = {
  formType: PropTypes.string
};

FormDescription.propTypes = {
  formType: PropTypes.string
};

Form.defaultProps = {
  initialCenter: {
    lat:40.730610,
    lng:-73.935242
  },
  errorCenter: {
    lat:29.532804,
    lng:-55.491477
  }
};


export default Form;
