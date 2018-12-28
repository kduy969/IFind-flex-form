import React from "react";

class DivHoz extends React.Component {
  render(){
    return <div className={this.props.className}
      style={{...{
        display:'flex',
        flexDirection:'horizontal'
      },...this.props.style}}>
      {this.props.children}
    </div>
  }
}

export default DivHoz
