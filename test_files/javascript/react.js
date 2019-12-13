import React from 'react';
import ReactDOM from 'react-dom';
import jquery from 'jquery';
import angular from 'angular';


class HelloWorld extends React.Component {
    render() {
          return (
                  <div>
                    Hello, React!!
                  </div>
                )
        }
};
 
ReactDOM.render(<HelloWorld />, document.getElementById('root'));