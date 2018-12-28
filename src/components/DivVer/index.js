import React from "react";

class DivVer extends React.Component {
  render(){

    return <div className={this.props.className} style={{...{
      display:'flex',
      alignItems:'flex-start',
      flexDirection:'column'
    },...this.props.style}}>
      {this.props.children}
    </div>
  }
}

export default DivVer
