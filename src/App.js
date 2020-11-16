import React from "react";
import "./App.scss";
import "./custom.scss";
import { Layout, Menu, Popover, message, Drawer, Button} from "antd";

import TodoList from "./components/TodoList";
import { gitlab } from "./api/gitlab";
import TodoListForm from "./components/TodoListForm";
import SearchForm from "./components/SearchForm";
import { LIST_SEPARATOR, PROJECT_ID, LABEL_ARCHIVED } from "./config";
import DropMenuItem from "./components/DropMenuItem";
import { faSquare, faStar, faTasks, faCalendarDay, faBars, faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import Sidebar from "react-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getActualLabelName, hasLabel, hasNoListLabel, filterExcluded } from "./utils";

const { Content, Sider } = Layout;

class App extends React.Component {
  state = {
    accounts: [],
    addListVisible: false,
    allIssues: [],
    search: null,
    sidebarVisible: true,
    docked: false
  };
  componentDidMount = () => {
    // Get all labels
    console.log("compo")
    let localLabels = JSON.parse(localStorage.getItem("labels"));
    // console.log("Using local labels", localLabels);
    if (localLabels != null && localLabels.length > 0) {
      // console.log("Using local labels", localLabels);
      const selectedList = JSON.parse(localStorage.getItem("selectedList"))
      this.setState({
        ...this.state,
        label: selectedList? selectedList : localLabels[0],
        labels: localLabels
      });
    } else {
      if (!this.state.labels ) {
        this.updateAllLabels();
      }
    }

    // get al Tasks
    let localTodos = JSON.parse(localStorage.getItem("allIssues"));
    // console.log("localTodos: ", localTodos);
    if (localTodos != null && localTodos.length > 0) {
      // console.log("Using local Todods");
      this.setState({
        ...this.state,
        allIssues: localTodos.sort((a, b) => a.id - b.id)
          // .filter(i => hasLabel(i, this.state.label.name))
      });
    } else {
      if (this.state.allIssues.length === 0) {
        // console.log("State issues.length is 0");
        this.updateTodos(this.state.label);
      }
    } // when you remove from my day the issue loses all labels except my day.
  };
  componentDidUpdate = () => {};
  createList = (name, color) => {
    console.log("createList ", name);
    gitlab.Labels.create(PROJECT_ID, name, color).then(e => {
      console.log(e);
      this.state.labels.push(e);
      message.success("Todo list created");
      this.hide();
      this.setState({ ...this.state, labels: this.state.labels, label: e });
    });
  };
  updateAllLabels = () => {
    gitlab.Labels.all(PROJECT_ID).then(labels => {
      const filteredLabels = labels.filter(
        l => l.name.indexOf("list" + LIST_SEPARATOR) === 0
      );
      console.log("Labels received: ", filteredLabels);
      localStorage.setItem("labels", JSON.stringify(filteredLabels));
      this.setState({ ...this.state, labels: filteredLabels });
    });
  }
  hide = () => {
    this.setState({
      addListVisible: false
    });
  };
  updateTodos = () => {
    console.log("Update tasks from Gitlab");
    this.setState({ ...this.state, allIssues: [], list: null });

    gitlab.Issues.all({ projectId: PROJECT_ID }).then(e => {
      const sortedTasks = e.filter(i=> i.state !== "closed").sort((a, b) => a.id - b.id)
      console.log("Received tasks frrom Gitlab", sortedTasks);
      localStorage.setItem("allIssues", JSON.stringify(sortedTasks));
      this.setState({ ...this.state, allIssues: sortedTasks});
    });
    this.updateAllLabels()
  };
  updateTodo = issue => {
    console.log("updtaeTood: ", issue);
    console.log("issues before update: ", this.state.allIssues);
    let issues = this.state.allIssues.filter(i => i.id !== issue.id);
    issues.push(issue);
    console.log("after update: ", issues);

    this.setState({
      ...this.state,
      allIssues: issues.sort((a, b) => a.id - b.id)
    });
  };
  removeTodo = issue => {
    let issues = this.state.allIssues.filter(i => i.iid !== issue.iid);
    message.success("Task was removed");

    this.setState({
      ...this.state,
      allIssues: issues.sort((a, b) => a.id - b.id)
    });
  };
  handleVisibleChange = () => {
    this.setState({ addListVisible: !this.state.addListVisible });
  };
  // if (this.state.accounts.length === 0) {
  //   Account.findAll(result => {
  //     console.log(result)
  //     this.setState({
  //       accounts: result.slice(0, MATCHING_ITEM_LIMIT)
  //     });
  //   });
  // }
  onSetSidebarOpen = open => {
    this.setState({ sidebarOpen: open });
  };
  selectTaskList = (list) => {
    
    this.setState({label: list, search: null})
    localStorage.setItem("selectedList", JSON.stringify(list))
  }
  showDrawer = () => {
    this.setState({
      sidebarVisible: true,
    });
  };

  onClose = () => {
    this.setState({
      sidebarVisible: false,
      docked: false
    });
  };
  render() {
    const mydaycount = this.state.allIssues.filter(i=> hasLabel(i, "meta::myday")).length
    let issuesToDisplay = []
    let todoListId = this.state.search ? 'search' :  (this.state.label ? this.state.label.id : 'other')
    const labelProp = this.state.search ? null : this.state.label
    let titleProp = 'test'

    if (this.state.search) {
      titleProp = "Search for \"" +this.state.search + "\""
      console.log("searching fo r", this.state.search)
      const s = this.state.search.toLowerCase()
      issuesToDisplay = this.state.allIssues.filter(i=> (i.title && i.title.toLowerCase().indexOf(s) > -1) || (i.description && i.description.toLowerCase().indexOf(s) > -1))
    } else {
      if (this.state.label) {
        titleProp = this.state.label.title ? this.state.label.title  :  getActualLabelName(this.state.label)
        issuesToDisplay = this.state.allIssues.filter(i => {
          if (this.state.label.name === "ALL") {
            return hasNoListLabel(i)
          } else if (this.state.label.name !== LABEL_ARCHIVED && i.labels.indexOf(LABEL_ARCHIVED) > -1) {
            return false
          } else {
            return hasLabel(i, this.state.label.name)
          }
          }).sort((a, b) => a.id - b.id)
        }
      }
      let mainstyle = {}
      const buttonStyle= {
        width: "28px",
        margin: '10px 0 0 0px',
        padding: "2px",
        position: "fixed",
        top: "-3px",
        zIndex: 50,
        left: "10px"
      }
      if (this.state.sidebarVisible) {
        buttonStyle.left = "260px";
      } else {
        

      }
    return (
 
          
          <Sidebar
            sidebarId="mainMenu"
            sidebarClassName="main-menu-class"
            sidebar={
                <div>
                <div>
                <SearchForm onSubmit={search => {
                  this.setState({search: search.search});
                }}/>
              </div>
              <Menu 
              theme="dark"
                mode="inline"
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["accounts", "todolists"]}
                style={{ borderRight: 0, width:'250px' }}
              >
                <DropMenuItem
                  onClick={e => {
                    this.selectTaskList({  name: "meta::myday", title: "My Day" } );
                    this.onClose();
                  }}
                  icon={faCalendarDay}
                  right={mydaycount}
                  key={"meta::myday"}
                  label="My Day"
                  title="My Day"
                />
                <DropMenuItem
                  onClick={e => {
                    this.selectTaskList({ name: "ALL", title: "My Tasks"});
                    this.onClose();
                  }}
                  icon={faTasks}
                  right={filterExcluded(this.state.allIssues.filter(i=> hasNoListLabel(i))).length}
                  key="mytasks"
                  label="My Tasks"
                  title="My Tasks"
                />
                <DropMenuItem
                  onClick={e => {
                    this.selectTaskList({  name: "meta::starred", title: "Important Tasks" } );
                    this.onClose();
                  }}
                  icon={faStar}
                  right={filterExcluded(this.state.allIssues.filter(i=> hasLabel(i, "meta::starred"))).length}

                  key={"meta::starred"}
                  label="Important"
                  title="Important"
                />
                    <Menu.Divider />
              
              
                  { this.state.labels &&
                    this.state.labels.map(l => (
                      <DropMenuItem
                        onClick={e => {
                          this.selectTaskList( l )
                          this.onClose()
                        }}
                        key={l.id}
                        label={getActualLabelName(l)}
                        right={filterExcluded(this.state.allIssues.filter(i=> hasLabel(i, l.name))).length}
                        faicon={<FontAwesomeIcon icon={faSquare} color={l.color} size="lg" style={{marginRight: '20px'}} />}
                      />
                    ))}
                  <span>
                      <Popover
                        content={<TodoListForm onSubmit={this.createList} />}
                        visible={this.state.addListVisible}
                        onVisibleChange={this.handleVisibleChange}
                        title="Add List"
                        trigger="click"
                      >
                          
                        <FontAwesomeIcon icon={faPlusSquare} className="heading-color" style={{ float: "right", cursor: 'hand', marginRight: '17px' }} size="lg" onClick={e => this.handleVisibleChange()}/>
                      </Popover>
                    </span>
              <div onClick={e => {
                    this.selectTaskList({  name: LABEL_ARCHIVED, title: "Archived Tasks" } );
                  }} style={{padding: "10px 10px 0px 10px"}}>
                <span className="text-muted">Archived</span>
              </div>
              </Menu>
              </div>

                }
            open={this.state.sidebarVisible}
            onSetOpen={this.showDrawer}
            style={{sidebar: {backgroundColor: "rgb(37, 38, 39)"}}}
          >
            <Layout  theme="dark">
            {this.state.sidebarVisible === false && <Button size="small" style={{...buttonStyle, ...mainstyle}} onClick={e=> this.showDrawer()}><FontAwesomeIcon icon={faBars}  size="lg" /></Button>}
            {this.state.sidebarVisible && <Button size="small" style={{...buttonStyle, ...mainstyle}}  onClick={e=> this.onClose()}><FontAwesomeIcon icon={faBars}  size="lg" /></Button> }
      

            <Layout style={{ padding: "0", minHeight: "100%", ...mainstyle }} >
              <Content
                style={{
                  padding: 10,
                  margin: 0
                }}
              >
                {this.state.label && (
                  <TodoList key={todoListId} label={labelProp} title={titleProp}
                  updateTodo={this.updateTodo}
                  updateTodos={this.updateTodos}
                  removeTodo={this.removeTodo}
                  issues={issuesToDisplay} 
                  onSelectLabel={
                    label => this.setState({label: {name: label, title: label}}) // not using select task list because we dont want to persist this
                  } />
                )}
              </Content>
            </Layout>
        </Layout>
      </Sidebar>
    );
  }
}

export default App;
