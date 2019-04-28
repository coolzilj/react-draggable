// // @flow
// import React from 'react';
// import PropTypes from 'prop-types';
// import ReactDOM from 'react-dom';
// import classNames from 'classnames';
// import {createCSSTransform, createSVGTransform} from './utils/domFns';
// import {canDragX, canDragY, createDraggableData, getBoundPosition} from './utils/positionFns';
// import {dontSetMe} from './utils/shims';
// import DraggableCore from './DraggableCore';
// import type {ControlPosition, DraggableBounds, DraggableCoreProps} from './DraggableCore';
// import log from './utils/log';
// import type {DraggableEventHandler} from './utils/types';
// import type {Element as ReactElement} from 'react';

// type AdvDraggableState = {
//   dragging: boolean,
//   dragged: boolean,
//   x: number, y: number,
//   slackX: number, slackY: number,
//   isElementSVG: boolean,
//   angle: number,
//   rotating: boolean,
//   rotated: boolean,
// };

// export type AdvDraggableRotateData = {
//   angle: number
// };

// export type AdvDraggableRotateEventHandler = (e: MouseEvent, data: AdvDraggableRotateData) => void;

// export type AdvDraggableProps = {
//   ...$Exact<DraggableCoreProps>,
//   axis: 'both' | 'x' | 'y' | 'none',
//   bounds: DraggableBounds | string | false,
//   defaultClassName: string,
//   defaultClassNameDragging: string,
//   defaultClassNameDragged: string,
//   defaultPosition: ControlPosition,
//   defaultAngle: number,
//   position: ControlPosition,
//   scale: number,
//   onRotateStart: AdvDraggableRotateEventHandler,
//   onRotateStop: AdvDraggableRotateEventHandler
// };

// export default class AdvDraggable extends React.Component<AdvDraggableProps, AdvDraggableState> {
//   static displayName = 'AdvDraggable';

//   static propTypes = {
//     ...DraggableCore.propTypes,
//     axis: PropTypes.oneOf(['both', 'x', 'y', 'none']),
//     bounds: PropTypes.oneOfType([
//       PropTypes.shape({
//         left: PropTypes.number,
//         right: PropTypes.number,
//         top: PropTypes.number,
//         bottom: PropTypes.number
//       }),
//       PropTypes.string,
//       PropTypes.oneOf([false])
//     ]),

//     defaultClassName: PropTypes.string,
//     defaultClassNameDragging: PropTypes.string,
//     defaultClassNameDragged: PropTypes.string,
//     defaultPosition: PropTypes.shape({
//       x: PropTypes.number,
//       y: PropTypes.number
//     }),
//     defaultAngle: PropTypes.number,
//     position: PropTypes.shape({
//       x: PropTypes.number,
//       y: PropTypes.number
//     }),
//     className: dontSetMe,
//     style: dontSetMe,
//     transform: dontSetMe,
//     scale: PropTypes.number,
//     onRotateStart: PropTypes.func,
//     onRotateStop: PropTypes.func
//   };

//   static defaultProps = {
//     ...DraggableCore.defaultProps,
//     axis: 'both',
//     bounds: false,
//     defaultClassName: 'react-draggable',
//     defaultClassNameDragging: 'react-draggable-dragging',
//     defaultClassNameDragged: 'react-draggable-dragged',
//     defaultPosition: {x: 0, y: 0},
//     defaultAngle: 0,
//     position: null,
//     scale: 1,
//     onRotateStart: function(){},
//     onRotateStop: function(){}

//   };

//   constructor(props: AdvDraggableProps) {
//     super(props);

//     this.state = {
//       dragging: false,
//       dragged: false,

//       x: props.position ? props.position.x : props.defaultPosition.x,
//       y: props.position ? props.position.y : props.defaultPosition.y,

//       slackX: 0, slackY: 0,

//       isElementSVG: false,

//       angle: props.defaultAngle,
//       rotating: false,
//       rotated: false,
//     };
//   }

//   componentWillMount() {
//     if (this.props.position && !(this.props.onDrag || this.props.onStop)) {
//       // eslint-disable-next-line
//       console.warn('A `position` was applied to this <AdvDraggable>, without drag handlers. This will make this ' +
//         'component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the ' +
//         '`position` of this element.');
//     }
//   }

//   componentDidMount() {
//     if(typeof window.SVGElement !== 'undefined' && ReactDOM.findDOMNode(this) instanceof window.SVGElement) {
//       this.setState({ isElementSVG: true });
//     }
//   }

//   componentWillReceiveProps(nextProps: Object) {
//     if (nextProps.position &&
//         (!this.props.position ||
//           nextProps.position.x !== this.props.position.x ||
//           nextProps.position.y !== this.props.position.y
//         )
//       ) {
//       this.setState({ x: nextProps.position.x, y: nextProps.position.y });
//     }

//     if (nextProps.defaultAngle !== this.props.defaultAngle) {
//       this.setState({ angle: nextProps.defaultAngle });
//     }
//   }

//   componentWillUnmount() {
//     this.setState({dragging: false});
//   }

//   onRotateMouseDown = (e) => {
//     log('AdvDraggable: onRotateMouseDown: %j', e);
//     this.props.onRotateStart(e, { angle: this.state.angle });
//     this.setState({rotating: true, rotated: true});
//   }

//   onRotateMouseUp = (e) => {
//     log('AdvDraggable: onRotateMouseUp: %j', e);

//     if (!this.state.rotating) return false;
//     this.props.onRotateStop(e, { angle: this.state.angle });
//     this.setState({rotating: false});
//   }

//   onRotateMouseMove = (e: MouseEvent) => {
//     log('AdvDraggable: onRotateMouseMove: ', e);

//     if (!this.state.rotating) return false;

//     const x = e.pageX;
//     const y = e.pageY;
//     const {left, top, width, height} = ReactDOM.findDOMNode(this).getBoundingClientRect();
//     const centerX = left + width / 2;
//     const centerY =  top + height / 2;
//     let angle = this.getAngle(centerX, centerY, x, y);

//     const mod = angle % 90;
//     if (Math.abs(mod) < 2) {
//       angle -= mod;
//     } else {
//       if (mod >= 88 && mod <= 90) {
//         angle += 90 - mod;
//       } else {
//         if (mod >= -90 && mod <= -88) {
//           angle -= 90 + mod;
//         }
//       }
//     }

//     this.setState({angle});
//   }

//   getAngle = (centerX, centerY, pageX, pageY): number => {
//     const x = Math.abs(centerX - pageX);
//     const y = Math.abs(centerY - pageY);
//     const z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
//     const cos = y / z;
//     const radian = Math.acos(cos);
//     let angle = Math.floor(180 / (Math.PI / radian));
//     if (pageX > centerX && pageY > centerY) {
//       angle = 180 - angle;
//     }
//     if (pageX == centerX && pageY > centerY) {
//       angle = 180;
//     }
//     if (pageX > centerX && pageY == centerY) {
//       angle = 90;
//     }
//     if (pageX < centerX && pageY > centerY) {
//       angle = 180 + angle;
//     }
//     if (pageX < centerX && pageY == centerY) {
//       angle = 270;
//     }
//     if (pageX < centerX && pageY < centerY) {
//       angle = 360 - angle;
//     }
//     angle %= 360;
//     angle = angle > 180 ? angle % 180 - 180 : angle;
//     return angle;
//   }

//   onDragStart: DraggableEventHandler = (e, coreData) => {
//     log('AdvDraggable: onDragStart: %j', coreData);

//     const shouldStart = this.props.onStart(e, createDraggableData(this, coreData));
//     if (shouldStart === false) return false;

//     this.setState({dragging: true, dragged: true});
//   };

//   onDrag: DraggableEventHandler = (e, coreData) => {
//     if (!this.state.dragging) return false;
//     log('AdvDraggable: onDrag: %j', coreData);

//     const uiData = createDraggableData(this, coreData);

//     const newState: $Shape<AdvDraggableState> = {
//       x: uiData.x,
//       y: uiData.y
//     };

//     if (this.props.bounds) {
//       const {x, y} = newState;

//       newState.x += this.state.slackX;
//       newState.y += this.state.slackY;

//       const [newStateX, newStateY] = getBoundPosition(this, newState.x, newState.y);
//       newState.x = newStateX;
//       newState.y = newStateY;

//       newState.slackX = this.state.slackX + (x - newState.x);
//       newState.slackY = this.state.slackY + (y - newState.y);

//       uiData.x = newState.x;
//       uiData.y = newState.y;
//       uiData.deltaX = newState.x - this.state.x;
//       uiData.deltaY = newState.y - this.state.y;
//     }

//     const shouldUpdate = this.props.onDrag(e, uiData);
//     if (shouldUpdate === false) return false;

//     this.setState(newState);
//   };

//   onDragStop: DraggableEventHandler = (e, coreData) => {
//     if (!this.state.dragging) return false;

//     const shouldStop = this.props.onStop(e, createDraggableData(this, coreData));
//     if (shouldStop === false) return false;

//     log('AdvDraggable: onDragStop: %j', coreData);

//     const newState: $Shape<AdvDraggableState> = {
//       dragging: false,
//       slackX: 0,
//       slackY: 0
//     };

//     const controlled = Boolean(this.props.position);
//     if (controlled) {
//       const {x, y} = this.props.position;
//       newState.x = x;
//       newState.y = y;
//     }

//     this.setState(newState);
//   };

//   render(): ReactElement<any> {
//     let style = {}, svgTransform = null;

//     const controlled = Boolean(this.props.position);
//     const draggable = !controlled || this.state.dragging;

//     const position = this.props.position || this.props.defaultPosition;
//     const transformOpts = {
//       x: canDragX(this) && draggable ?
//         this.state.x :
//         position.x,

//       y: canDragY(this) && draggable ?
//         this.state.y :
//         position.y,

//       angle: this.state.angle,
//     };

//     if (this.state.isElementSVG) {
//       svgTransform = createSVGTransform(transformOpts);
//     } else {
//       style = createCSSTransform(transformOpts);
//     }

//     const {
//       defaultClassName,
//       defaultClassNameDragging,
//       defaultClassNameDragged,
//       scale
//     } = this.props;

//     const children = React.Children.only(this.props.children);

//     const className = classNames((children.props.className || ''), defaultClassName, {
//       [defaultClassNameDragging]: this.state.dragging,
//       [defaultClassNameDragged]: this.state.dragged
//     });

//     const width = 16 / scale
//     const rotateHandlerCircleStyle = {
//       background: '#fff',
//       position: 'absolute',
//       left: '50%',
//       marginLeft: `${-width/2}px`,
//       marginTop: `${-width/2*3}px`,
//       width: `${width}px`,
//       height: `${width}px`,
//       // border: `${1/scale}px solid #666`,
//       borderRadius: '100%',
//       cursor: 'grab',
//     };

//     // const rotateHandlerLineStyle = {
//     //   position: 'absolute',
//     //   left: '50%',
//     //   top: '15px',
//     //   width: '1px',
//     //   height: '10px',
//     //   background: '#666',
//     // };

//     const rotateHandlerSvgStyle = {
//       width: '100%',
//       height: '100%',
//       position: 'absolute'
//     };

//     let activeStyle = this.props.disabled ? { zIndex: 'auto' } : { zIndex: 99999 }

//     return (
//       <DraggableCore
//         {...this.props}
//         onStart={this.onDragStart}
//         onDrag={this.onDrag}
//         onStop={this.onDragStop}
//       >
//         {React.cloneElement(children, {
//           className: className,
//           style: {...children.props.style, ...style, ...activeStyle},
//           transform: svgTransform
//         }, [
//           this.props.children.props.children,
//           <DraggableCore
//             key="rotateHandle"
//             onStart={this.onRotateMouseDown}
//             onDrag={this.onRotateMouseMove}
//             onStop={this.onRotateMouseUp}
//             handle=".rotateHandle"
//           >
//             <span
//               className="rotateHandle"
//               style={rotateHandlerCircleStyle}
//               hidden={this.props.disabled}
//             >
//               <svg style={rotateHandlerSvgStyle} viewBox="0 0 1024 1024"><defs><style type="text/css"></style></defs><path d="M512 1024C230.4 1024 0 793.6 0 512c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667c0 234.666667 192 426.666667 426.666667 426.666667s426.666667-192 426.666667-426.666667S746.666667 85.333333 512 85.333333C371.2 85.333333 234.666667 157.866667 157.866667 273.066667 145.066667 294.4 119.466667 298.666667 98.133333 285.866667 76.8 273.066667 72.533333 247.466667 85.333333 226.133333 183.466667 85.333333 341.333333 0 512 0c281.6 0 512 230.4 512 512S793.6 1024 512 1024z" p-id="2277" fill="#666666"></path><path d="M256 341.333333 85.333333 341.333333C59.733333 341.333333 42.666667 324.266667 42.666667 298.666667L42.666667 128c0-25.6 17.066667-42.666667 42.666667-42.666667s42.666667 17.066667 42.666667 42.666667l0 128 128 0c25.6 0 42.666667 17.066667 42.666667 42.666667S281.6 341.333333 256 341.333333z" p-id="2278" fill="#666666"></path><path d="M512 682.666667c-93.866667 0-170.666667-76.8-170.666667-170.666667s76.8-170.666667 170.666667-170.666667 170.666667 76.8 170.666667 170.666667S605.866667 682.666667 512 682.666667zM512 426.666667c-46.933333 0-85.333333 38.4-85.333333 85.333333s38.4 85.333333 85.333333 85.333333 85.333333-38.4 85.333333-85.333333S558.933333 426.666667 512 426.666667z" p-id="2279" fill="#666666"></path></svg>
//               {/* <span style={rotateHandlerLineStyle}></span> */}
//             </span>
//           </DraggableCore>
//         ])}
//       </DraggableCore>
//     );
//   }
// }
