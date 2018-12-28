/**
 * Created by kduyi on 19-Jun-18.
 */
import React from "react";

class HozScroll extends React.Component {
  render(){
    return <ul className={this.props.className} style={{...{
      margin:0,
      padding:0,
      overflowX:"scroll"
    },...this.props.style}}>
      {this.props.children}
    </ul>
  }
}

export default HozScroll
