import React from 'react';
// import { useDrop } from 'react-dnd'
import {  Menu } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DropMenuItem = (props) => {
    let { label, icon,right, faIcon } = props
    // const [{ canDrop, isOver }, drop] = useDrop({
    //     accept: 'box',
    //     drop: () => ({ name: 'Dustbin' }),
    //     collect: monitor => ({
    //       isOver: monitor.isOver(),
    //       canDrop: monitor.canDrop(),
    //     }),
    //   })
    return <Menu.Item {...props} >{faIcon ? faIcon : <FontAwesomeIcon icon={icon} style={{marginRight: '20px'}} /> }  {label}<div className="menu-right " >{right}</div></Menu.Item>
                    
    }

export default DropMenuItem;