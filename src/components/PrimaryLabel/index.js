/**
 * Created by kduyi on 20-Jun-18.
 */
import React from "react";
import {Label} from "reactstrap";
import {COLOR} from "../../../constant/color";

class PrimaryLabel extends React.PureComponent {
  render(){
      console.log("PrimaryLabel","RENDER");
    return <div className={this.props.className}
                style={this.props.style}>
      {this.props.children}
    </div>
  }
}

export default PrimaryLabel
