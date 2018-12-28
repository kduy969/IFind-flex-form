/**
 * Created by kduyi on 19-Jun-18.
 */
import React from "react";

class HozItem extends React.Component {
  render(){
    return <li className={this.props.className} style={{...{
      margin:0,
      padding:0,
      listStyleType:"none"
    },...this.props.style}}>
      {this.props.children}
    </li>
  }
}

export default HozItem
