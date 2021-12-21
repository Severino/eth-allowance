import { Component } from "react";
import "../styles/spinner.css";

class Spinner extends Component {
  renderText() {
    if (this.props.total == null) {
      return <div>Fetching Items ...</div>;
    } else {
      return (
        <div>
          Loading items {this.props.current}/{this.props.total}
        </div>
      );
    }
  }

  render() {
    return (
      <div className="spinner">
        <div className="lds-grid">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {this.renderText()}
      </div>
    );
  }
}

export default Spinner;
