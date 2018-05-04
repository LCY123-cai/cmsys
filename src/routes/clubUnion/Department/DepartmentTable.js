import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Card,
  Button,
  message,
  Divider,
  Switch
} from 'antd';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import DepartmentForm from './DepartmentForm';
import DepartmentModal from './DepartmentModal';
import moment from 'moment';

@connect(state => ({
  clubDepartment: state.clubDepartment
}))
export default class DepartmentTable extends PureComponent {
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
    formValues: {},
    SwitchLoadingId: ''


  };

  componentDidMount() {
    this.getData({})
  }

  getData(params) {
    this.props.dispatch({
      type: 'clubDepartment/queryList',
      payload: {
        categoryId: '',
        pageNo: 1,
        pageSize: 10,
        ...params
      }
    });
  }

  handleStandardTableChange = (pagination) => {
    const {formValues} = this.state;
    this.getData({
      categoryId: formValues.categoryId,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    })
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
          type: 'clubDepartment/getOne',
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

  handleSearch(value) {
    this.setState({
      formValues: value
    });
    this.getData({
      categoryId: value.categoryId,
      pageNo: 1,
      pageSize: 10
    })
  }

  handleFormReset() {
    this.setState({
      formValues: {}
    });
  }

  handleDelete(delOneId) {
    /*
     * delOneId：删除单个时的传参
     * */
    const {dispatch, clubDepartment: {data: {pagination}}} = this.props;
    let {selectedRows, formValues} = this.state;
    let ids = selectedRows.map((item) => (item.id));
    if (arguments.length > 1) {//删除单个
      ids.push(delOneId);
    }
    if (!ids) return;

    dispatch({
      type: 'clubDepartment/changeLoading',
      payload: {
        bool: true,
      },
    });
    dispatch({
      type: 'clubDepartment/dels',
      payload: {
        ids: ids
      },
      callback: () => {
        this.getData({
          ...formValues,
          pageNo: pagination.currentPage,
          pageSize: pagination.pageSize,
        })
        this.setState({
          selectedRows: [],
        });
      }
    });
  }

  handleChangeStatus(val, id) {
    const {dispatch} = this.props;
    let type = val == 0 ? 'clubDepartment/enable' : 'clubDepartment/disable';
    this.setState({
      SwitchLoadingId: id,
    });
    dispatch({
      type: type,
      payload: {
        id: id
      },
      callback: () => {
        this.setState({
          SwitchLoadingId: '',
        });
      }
    });
  }

  render() {
    const {clubDepartment: {loading: clubDepartmentLoading, data}} = this.props;
    const {selectedRows} = this.state;
    const columns = [
      {
        title: '部门名称',
        dataIndex: 'name',
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (val, record) => {
          return (
            <Switch
              loading={record.id === this.state.SwitchLoadingId}
              checked={val == 1}
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={this.handleChangeStatus.bind(this, val, record.id)}
            />
          );
        },
      },
     /* {
        title: '添加时间',
        dataIndex: 'insertTime',
        render(val) {
          return <span>{moment(val).format('YYYY-MM-DD')}</span>;
        },
      },
      {
        title: '添加人',
        dataIndex: 'insertMan',
        render(val) {
          return val;
        },
      },*/
      /*{
        title: '最后修改时间',
        dataIndex: 'lastupdTime',
        render(val) {
          return <span>{moment(val).format('YYYY-MM-DD')}</span>;
        },
      },
      {
        title: '最后修改人',
        dataIndex: 'lastupdMan',
        render(val) {
          return val;
        },
      },*/
      {
        title: '操作',
        dataIndex: 'id',
        render: (val) => (
          <div>

            <a href="javascript:;" onClick={this.handelModal.bind(this, 'read', val)}>查看详细</a>
            <Divider type="vertical"/>
            <a href="javascript:;" onClick={this.handelModal.bind(this, 'edit', val)}>修改</a>
            <Divider type="vertical"/>
            <a href="javascript:;" onClick={this.handleDelete.bind(this, val)}>删除</a>
          </div>
        ),
      },
    ];
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className="tableList">
            <div className="tableListForm">
              <DepartmentForm
                handleSearch={this.handleSearch.bind(this)}
                formReset={this.handleFormReset.bind(this)}
              />
            </div>
            <div className="tableListOperator">
              <Button icon="plus" type="primary" onClick={this.handelModal.bind(this, 'add')}>新建</Button>
              {
                selectedRows.length > 0 && (
                  <span>
                     <Button onClick={this.handleDelete.bind(this)}>删除</Button>
                   </span>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={clubDepartmentLoading}
              columns={columns}
              data={data}
              isSelect={true}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <DepartmentModal modalVisible={this.state.modalVisible}
                         modalLoading={this.state.modalLoading}
                         data={this.state.modalData}
                         dispatch={this.props.dispatch}
                         handleModalVisible={this.handleModalVisible.bind(this)}/>

      </PageHeaderLayout>
    );
  }
}
