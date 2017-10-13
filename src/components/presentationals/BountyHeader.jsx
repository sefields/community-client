import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ListItem} from './Common.jsx';

class BountyHeader extends Component {
  constructor(props){
    super(props);
    this.performParentAction = this.performParentAction.bind(this);
  }

  performParentAction(tag){
    this.props.trigger(tag);
  }

  render(){

    var bountyList = this.props.info.map((bounty, index) => {
      return (<ListItem key={index} title={bounty.title} icon={bounty.icon} tag={bounty.tag} action={this.performParentAction} />);
    });

    return(
      <div>
        <ul id="bounty-list" className="list-inline">{bountyList}</ul>
      </div>
    );
  }
}

BountyHeader.propTypes = {
  trigger: PropTypes.func,
  info: PropTypes.array
};

export default BountyHeader;