import React from 'react';
// import { useDrop } from 'react-dnd'
import {  Menu } from 'antd';

const DropMenuItem = (props) => {
    let { label, icon } = props
    // const [{ canDrop, isOver }, drop] = useDrop({
    //     accept: 'box',
    //     drop: () => ({ name: 'Dustbin' }),
    //     collect: monitor => ({
    //       isOver: monitor.isOver(),
    //       canDrop: monitor.canDrop(),
    //     }),
    //   })
return <Menu.Item {...props} ><span style={{marginRight: '10px'}} >{icon}</span>   {label}</Menu.Item>
    }

export default DropMenuItem;