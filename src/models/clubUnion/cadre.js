import {queryList, add, getOne, update, enable, disable, dels} from '../../services/clubUnion/cadre';

export default {
  namespace: 'clubUnionCadre',

  state: {
    data: {
      list: [
        /*{
         annual (string, optional): 任职年度 ,
         college (string, optional): 所属学院（从字典值中取） ,
         dept (string, optional): 部门 ,
         id (integer, optional): 干部id ,
         major (string, optional): 所属专业 ,
         name (string, optional): 姓名 ,
         position (string, optional): 现任职位 ,
         remarks (string, optional): 备注 ,
         sanction (string, optional): 奖罚情况 ,
         sex (string, optional): 性别 ,
         stuNum (string, optional): 学号
         }*/
      ],
      pagination: {},
    },
    loading: true,
    modalLoading: true,
  },

  effects: {
    *changeLoading({payload}, {call, put}) {
      yield put({
        type: 'changeLoadingReducers',
        payload: payload.bool,
      });
    },
    *queryList({payload}, {call, put}) {
      yield put({
        type: 'changeLoadingReducers',
        payload: true,
      });
      const response = yield call(queryList, payload);
      if (response.ret) {
        yield put({
          type: 'queryListReducers',
          payload: response.data,
        });
      }
      yield put({
        type: 'changeLoadingReducers',
        payload: false,
      });
    },
    *add({payload, callback}, {call}) {
      const response = yield call(add, payload);
      if (callback) callback(response);
    },
    *getOne({payload, callback}, {call}) {
      const response = yield call(getOne, payload);
      if (callback) callback(response);
    },
    *update({payload, callback}, {call}) {
      const response = yield call(update, payload);
      if (callback) callback(response);
    },
    *enable({payload, callback}, {call, put}) {
      const response = yield call(enable, payload);
      if (response.ret) {
        yield put({
          type: 'enableReducers',
          payload: {
            ids: payload.ids,
          }
        });
      }
      if (callback) callback(response);
    },
    *disable({payload, callback}, {call, put,}) {
      const response = yield call(disable, payload);
      if (response.ret) {
        yield put({
          type: 'disableReducers',
          payload: {
            ids: payload.ids,
          }
        });
      }
      if (callback) callback(response);
    },
    *dels({payload, callback}, {call, put,}) {
      const response = yield call(dels, payload);
      if (response.ret) {
        yield put({
          type: 'delsReducers',
          payload: {
            ids: payload.ids,
          }
        });
      }
      if (callback) callback(response);
    },

  },

  reducers: {
    queryListReducers(state, {payload}) {
      return {
        ...state,
        data: payload,
      };
    },
    changeLoadingReducers(state, {payload}) {
      return {
        ...state,
        loading: payload,
      };
    },
    enableReducers(state, {payload}) {
      const newList = state.data.list.map((item) => {
        if (payload.ids.find((id) => (id == item.id)) != undefined) {
          return {
            ...item,
            status: 1,
          }
        }
        return item;
      });
      return {
        ...state,
        data: {
          ...state.data,
          list: newList
        }
      };
    },
    disableReducers(state, {payload}) {
      const newList = state.data.list.map((item) => {
        if (payload.ids.find((id) => (id == item.id)) != undefined) {
          return {
            ...item,
            status: 0,
          }
        }
        return item;
      });
      return {
        ...state,
        data: {
          ...state.data,
          list: newList
        }
      };
    },
    delsReducers(state, {payload}) {
      const newList = state.data.list.filter((item) => {
        return payload.ids.find((id) => (id == item.id)) == undefined;
      });
      return {
        ...state,
        data: {
          ...state.data,
          list: newList
        }
      };
    },
  },
};
