import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Card,
  Button,
  message,
  Divider,
  Switch,
  Dropdown,
  Menu,
  Icon,
  Modal
} from 'antd';
const confirm = Modal.confirm;
import StandardTable from '../../../components/StandardTable/index';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import CadreForm from './CadreForm';
import CadreModal from './CadreModal';

@connect(state => ({
  clubCadre: state.clubCadre,
  dataManagement: state.dataManagement,
  currentUser: state.login.currentUser
}))
export default class CadreTable extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    modalLoading: false,
    modalData: {
      key: '',
      id: '',
      data: {}
    },
    expandForm: false,
    selectedRows: [],
    formValues: {
      keyword: ""
    },
    SwitchLoadingId: ''


  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'dataManagement/queryCollegeName'
    });
    this.getData({})
  }

  handleStandardTableChange = (pagination) => {
    const {formValues} = this.state;
    const params = {
      keyword: formValues.keyword,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    };
    this.getData(params)
  }

  handelModal(key, id) {
    switch (key) {
      case 'add':
        this.setState({
          modalVisible: true,
          modalData: {
            key,
            id: ''
          }
        });
        break;
      case 'read':
      case 'edit':
        this.setState({
          modalVisible: true,
          modalLoading: true,
          modalData: {
            key,
          }
        });
        this.props.dispatch({
          type: 'clubCadre/getOne',
          payload: {
            id
          },
          callback: (res) => {
            if (res.ret) {
              var old = this.state.modalData;
              this.setState({
                modalData: {
                  ...old,
                  data: res.data,
                },
                modalLoading: false,
              });
            } else if (res.msg) {
              message.error(res.msg);
            }
          }
        });

        break;
      default:
        return;
    }
  }

  handleModalVisible() {
    this.setState({
      modalVisible: false
    })
  }


  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  getData(params, isRefresh) {
    const {dispatch, currentUser} = this.props;
    if (isRefresh) {
      params = {
        keyword: '',
        pageNo: 1,
        pageSize: 10,
      }
    }
    dispatch({
      type: 'clubCadre/queryList',
      payload: {
        assId: currentUser.assId == -1 ? '' : currentUser.assId,
        keyword: '',
        pageNo: 1,
        pageSize: 10,
        ...params
      }
    });
  }

  handleSearch(value) {
    this.setState({
      formValues: {
        ...value
      },
      selectedRows: [],
    });
    this.getData(value);
  }

  handleFormReset() {
    this.setState({
      formValues: {}
    });
  }

  handleChangeStatus(val, id) {
    const {dispatch} = this.props;
    let type = val == 0 ? 'clubCadre/enable' : 'clubCadre/disable';
    this.setState({
      SwitchLoadingId: id,
      selectedRows: [],
    });
    dispatch({
      type: type,
      payload: {
        ids: [id]
      },
      callback: () => {
        this.setState({
          SwitchLoadingId: '',
        });
      }
    });
  }

  handleMenuClick(e) {
    const {dispatch} = this.props;
    const {selectedRows} = this.state;
    if (!selectedRows) return;
    let type = '';
    let newSelectedRows = [];
    let ids = [];
    switch (e.key) {
      case 'enable':
        type = 'clubCadre/enable';
        newSelectedRows = selectedRows.filter((item) => (item.status == 0));
        ids = newSelectedRows.map((item) => (item.id));
        break;
      case 'disable':
        type = 'clubCadre/disable';
        newSelectedRows = selectedRows.filter((item) => (item.status == 1));
        ids = newSelectedRows.map((item) => (item.id));
        break;
      default:
        break;
    }
    if (ids.length == 0) {
      return;
    }
    dispatch({
      type: 'clubCadre/changeLoading',
      payload: {
        bool: true,
      },
    });
    dispatch({
      type: type,
      payload: {
        ids: ids
      },
      callback: () => {
        this.setState({
          selectedRows: [],
        });
        dispatch({
          type: 'clubCadre/changeLoading',
          payload: {
            bool: false,
          },
        });
      }
    });
  }

  handleDelete(delOneId) {
    /*
     * delOneId：删除单个时的传参
     * */
    const {dispatch, clubCadre: {data: {pagination}}} = this.props;
    let {selectedRows, formValues} = this.state;
    let ids = selectedRows.map((item) => (item.id));
    if (arguments.length > 1) {//删除单个
      ids.push(delOneId);
    }
    if (!ids) return;

    confirm({
      title: '你确定要删除这些信息吗?',
      content: '删除后不可恢复',
      okText: '是的',
      okType: 'danger',
      cancelText: '不，取消',
      onOk: () => {
        dispatch({
          type: 'clubCadre/changeLoading',
          payload: {
            bool: true,
          },
        });
        dispatch({
          type: 'clubCadre/dels',
          payload: {
            ids: ids
          },
          callback: () => {
            dispatch({
              type: 'clubCadre/queryList',
              payload: {
                ...formValues,
                pageNo: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            });
            this.setState({
              selectedRows: [],
            });
          }
        });
      },
      onCancel() {
        message.warning('您取消了操作');
      },
    });
  }


  render() {
    const {currentUser, clubCadre: {loading: userLoading, data}, dataManagement: {collegeName}} = this.props;
    let collegeName_obj = {};
    collegeName.forEach((item) => {
      collegeName_obj[item.pmname] = item.pmvalue;
    });

    const {selectedRows} = this.state;
    const columns = [
      {
        title: '姓名 ',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '学号',
        dataIndex: 'stuNum',
        key: 'stuNum',
      },
      {
        title: '所属社团',
        dataIndex: 'assName',
        key: 'assName',
      },
      {
        title: '所属学院',
        dataIndex: 'college',
        key: 'college',
        render(val) {
          return collegeName_obj[val];
        },
      },
      {
        title: '所属专业',
        dataIndex: 'major',
        key: 'major',
      },
      {
        title: '任职状态',
        dataIndex: 'status',
        key: 'status',
        render: (val, record) => {
          if (currentUser.assId == -1) {
            return val == 1 ? '在职' : '离职'
          }
          return (
            <Switch
              loading={record.id === this.state.SwitchLoadingId}
              checked={val == 1}
              checkedChildren="在职"
              unCheckedChildren="离职"
              onChange={this.handleChangeStatus.bind(this, val, record.id)}
            />
          );
        },
      },
      {
        title: '部门',
        dataIndex: 'dept',
        key: 'dept',
      },
      {
        title: '现任职位',
        dataIndex: 'position',
        key: 'position',
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        render: (val) => (
          <div>
            <a href="javascript:;" onClick={this.handelModal.bind(this, 'read', val)}>查看详细</a>
            {currentUser.assId == -1 ? '' : (
              <span>
                 <Divider type="vertical"/>
                <a href="javascript:;" onClick={this.handelModal.bind(this, 'edit', val)}>修改</a>
                <Divider type="vertical"/>
                <a href="javascript:;" onClick={this.handleDelete.bind(this, val)}>删除</a>
              </span>
            )}
          </div>
        ),
      },
    ];
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this)} selectedKeys={[]}>
        <Menu.Item key="enable">在职</Menu.Item>
        <Menu.Item key="disable">离职</Menu.Item>
      </Menu>
    );
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className="tableList">
            <div className="tableListForm">
              <CadreForm
                handleSearch={this.handleSearch.bind(this)}
                formReset={this.handleFormReset.bind(this)}
                dispatch={this.props.dispatch}
              />
            </div>
            <div className="tableListOperator">
              {currentUser.assId == -1 ? '' : (
                <Button icon="plus" type="primary" onClick={this.handelModal.bind(this, 'add')}>新建</Button>
              )}
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button onClick={this.handleDelete.bind(this)}>删除</Button>
                     <Dropdown overlay={menu}>
                      <Button>
                        批量设置任职状态 <Icon type="down"/>
                      </Button>
                    </Dropdown>
                  </span>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={userLoading}
              columns={columns}
              data={data}
              isSelect={true}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CadreModal modalVisible={this.state.modalVisible}
                    modalLoading={this.state.modalLoading}
                    data={this.state.modalData}
                    dispatch={this.props.dispatch}
                    handleModalVisible={this.handleModalVisible.bind(this)}
                    collegeName={collegeName}
                    collegeNameObj={collegeName_obj}
                    handelGetData={this.getData.bind(this)}
        />

      </PageHeaderLayout>
    );
  }
}
