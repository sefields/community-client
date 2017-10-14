import React, {Component} from 'react';
import PropTypes from 'prop-types';
import '../../static/css/DavCard.css';

class DavCard extends Component {

  constructor(props){
    super(props);
  }

  componentDidMount(){
    this.props.getUser();
  }

  render(){
    return(
      <div className="col-sm-12" id="dav-card">
        <img id="card-logo" className="card-content" src="../../static/images/davcard-logo.png" />
        <h5 id="card-uid" className="card-content">{this.props.uid}</h5>
        <h5 id="card-balance" className="card-content"><span className="bal">Balance</span><br/>{this.props.balance} dav</h5>
        <div id="card-owner" className="card-content">
          <img id="card-avatar" src={this.props.avatar} />
          <h5 id="card-name">{this.props.name}</h5>
        </div>
      </div>
    );
  }
}

DavCard.propTypes = {
  uid: PropTypes.string,
  balance: PropTypes.number,
  name: PropTypes.string,
  avatar: PropTypes.string,
  getUser: PropTypes.func
};

export default DavCard;
