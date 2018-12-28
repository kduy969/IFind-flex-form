/**
 * Created by kduyi on 13-Aug-18.
 */


import produce from 'immer'
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { mergeConfig, renderFields} from "./helper/renderHelper";
import {addDefaultFieldPropSingle, addDefaultFieldsProp} from "./helper/defaultHelper";

export class UncontrolForm extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function


  constructor() {
    super();
    this.state = {};
    this.reset = this.reset.bind(this);
    this.onArrayAdd = this.onArrayAdd.bind(this);
    this.onArrayRemove = this.onArrayRemove.bind(this);

    this.emptyDataToState = this.emptyDataToState.bind(this);
    this.dataToState = this.dataToState.bind(this);
    this.updateState = this.updateState.bind(this);
    this.fileChange = this.fileChange.bind(this);
    this.filesRemove = this.filesRemove.bind(this);
    this.selectFieldChange = this.selectFieldChange.bind(this);

    this.fieldChange = this.fieldChange.bind(this);
    this.getFormData = this.getFormData.bind(this);
    this.clearForm = this.clearForm.bind(this);

    this.onFieldUpdate = this.onFieldUpdate.bind(this);

    //this.validateForm = this.validateForm.bind(this);
  }

  render() {

    console.log("UNCONTROLFORM", "RENDER");
    console.log("UNCONTROLFORM", this.state.fields);
    return (
      <div style={{padding: 0, width: "100%", height: "100%"}}>
        {renderFields(this.state.fields, this, [])}
      </div>
    );
  }

  componentDidMount() {
    //update relate field
    console.log("UNCONTROLFORM", "DID MOUNT");


  }

  componentWillUnmount() {
    console.log("UNCONTROLFORM", "UNMOUNT");
  }

  componentWillMount() {
    console.log("formConfig", this.props.formConfig);
    mergeConfig(this.props.formConfig);

    console.log("UNCONTROLFORM", "MOUNT");
    this.setState((state) => produce(state, (draft) => {
      this.updateFieldsToState(draft, this.props);
      this.updateState(draft, this.props);
      this.updateRelateFieldsToState(draft, this.props);
    }));
  }

  updateFieldsToState(draftState, props) {
    draftState.fields = produce(props.fields, (draftFields => {
      let {titleStyle, tooltipStyle, inputTextStyle} = props;

      let config = {titleStyle, tooltipStyle, inputTextStyle};
      addDefaultFieldsProp(draftFields, config);
    }));
  }

  componentWillReceiveProps(nextProps, nextContext) {
    console.log("UNCONTROLFORM", "RECEIVE PROPS");
    this.setState((state) => produce(state, (draft) => {
      if (this.props.fields !== nextProps.fields) {
        console.log("UNCONTROLFORM", "UPDATE FIELDS");
        this.updateFieldsToState(draft, nextProps);
        this.updateState(draft, nextProps);
        this.updateRelateFieldsToState(draft, nextProps);
      }
      if (this.props.initialData !== nextProps.initialData) {
        console.log("UNCONTROLFORM", "UPDATE DATA");
        this.updateState(draft, nextProps);
        this.updateRelateFieldsToState(draft, nextProps);
      }
    }));
  }

  stateToDataGroup(state, data, field, key) {
    //ignore key
    for (var i = 0; i < field.childFields.length; i++) {
      let childField = field.childFields[i];
      if (!this.stateToData(state, data, childField)) {
        return false
      }
    }

    return true;
  }

  stateToDataObject(state, data, field, key) {
    let result = true;
    data[key] = {};
    let childData = data[key];
    let childState = state[key];

    for (var i = 0; i < field.childFields.length; i++) {
      let childField = field.childFields[i];
      if (!this.stateToData(childState, childData, childField)) {
        return false
      }

    }

    return true;
  }

  stateToDataArray(state, data, field, key) {
    data[key] = [];
    let arrayData = data[key];
    let array = state[key];
    for (let i = 0; i < array.length; i++) {
      if (!this.stateToData(array, arrayData, field.itemField, i)) {
        return false;
      }
    }
    return true;
  }

  stateToDataSelect(state, data, field, key) {
    if (field.required && field.options.length > 0 && state[key].value === "") {
      this.props.toastError(field.fieldName + ' is required');
      return false;
    }
    if (field.formatOut !== undefined) {
      data[key] = field.formatOut(state[key].value);
    }
    else
      data[key] = state[key].value;
    return true;
  }

  stateToDataDefault(state, data, field, key) {
    if (field.required && state[key].value === "") {
      this.props.toastError(field.fieldName + ' is required');
      return false;
    }
    if (field.formatOut !== undefined) {
      data[key] = field.formatOut(state[key].value);
    }
    else
      data[key] = state[key].value;
    return true;
  }

  stateToDataFiles(state, data, field, key) {
    //data[field.fileRemoveKey] = state[field.fileRemoveKey]
    if (field.required && state[key].value.length === 0) {
      this.props.toastError('Please provide at least 1 ' + field.fieldName);
      return false;
    }

    data[key] = [];
    state[key].value.map((image) => {
      if (image instanceof File) {
        data[key].push(image);
      }
    })
    data[field.fileRemoveKey] = state[key][field.fileRemoveKey];
    return true;
  }

  stateToDataFile(state, data, field, key) {
    if (field.required && state[key].value === "") {
      this.props.toastError(field.fieldName + ' is required');
      return false;
    }
    if (state[key].value instanceof File)
      data[key] = state[key].value;
    else
      data[key] = null;
    return true;
    //data[field.fileRemoveKey] = state[field.fileRemoveKey]
  }

  /*stateToDataSingle(state, data, field, key) {
    return this.stateToData(state, data, field, key)
  }*/

  //transfer from state object to data object base on field and key
  //field for extra info about data type...
  //key define
  //for single field and object, array
  stateToData(state, data, field, key) {
    if (typeof key === "undefined")
      key = field.fieldKey;
    if (field.type === "object") {
      if (!this.stateToDataObject(state, data, field, key)) {
        return false;
      }
    }
    else if (field.type === "array") {
      if (!this.stateToDataArray(state, data, field, key)) {
        return false;
      }
    }
    else if (field.type === "files") {
      if (!this.stateToDataFiles(state, data, field, key)) {
        return false;
      }
    }
    else if (field.type === "file") {
      if (!this.stateToDataFile(state, data, field, key)) {
        return false;
      }
    }
    else if (field.type === "select") {
      if (!this.stateToDataSelect(state, data, field, key)) {
        return false;
      }
    }
    else {
      if (!this.stateToDataDefault(state, data, field, key)) {
        return false;
      }
    }

    return true;

  }

  //for all kind of field, general case
  stateToDataAll(state, data, field, key) {
    if (field instanceof Array) {
      for (let i = 0; i < field.length; i++) {
        let childField = field[i];
        if (childField.isKey || childField.enable || childField.forceSubmitWhenDisable || childField instanceof Array) {
          if (!this.stateToDataAll(state, data, childField, key)) {
            return false;
          }
        }
      }
    }
    else if (field.type === "group") {
      let childFields = field.childFields;
      for (let i = 0; i < childFields.length; i++) {
        let childField = childFields[i];
        if (!this.stateToDataAll(state, data, childField, key)) {
          return false;
        }
      }
    }
    else {
      if (!this.stateToData(state, data, field, key))
        return false;
    }
    return true;
  }

  getFormData() {
    let data = {};
    let result = true;

    for (var i = 0; i < this.state.fields.length; i++) {
      let field = this.state.fields[i];
      //todo change condition enable -> submitable
      if (field.isKey || field.enable || field.forceSubmitWhenDisable || field instanceof Array) {
        if (!this.stateToDataAll(this.state, data, field)) {
          result = false;
          break;
        }
      }
    }

    return {result, data};
  }

  emptyDataToState(parents, field, state, key) {
    if (typeof key === "undefined") {
      key = field.fieldKey;
    }
    state[key] = {};

    //set all dynamic option here except value
    state[key].hidden = field.hidden;
    state[key].enable = field.enable;
    state[key].options = field.options;


    //set value
    if (field.type === "object") {
      let childState = state[key];
      field.childFields.map((childField) => {
        if (childField.default === undefined)
          this.emptyDataToState(parents, childField, childState);
        else
          this.dataToState(parents, childField, childField.default, childState);
      });
    }
    else if (field.type === "array") {
      state[key] = [];
    }
    else if (field.type === "files") {
      state[key].value = [];
      state[key].preview = [];
      state[key][field.fileRemoveKey] = [];
    }
    else if (field.type === "file") {
      state[key].preview = "";
      state[key].value = "";
    }
    else if (field.type === "select") {
      state[key].selected = "";
      state[key].value = "";
      console.log("SELECT", field);
      console.log("SELECT", key);
    }
    else {
      let empty = "";

      if (field.formatIn !== undefined) {
        state[key].value = field.formatIn(empty);
      }
      else
        state[key].value = empty;
    }
  }

  //add initdata to state[field.fieldKey/key],
  // also add extra data for select, file...
  //recursive to object , array
  //todo note why need to pass parents
  dataToState(parents, field, initData, state, key) {
    if (typeof key === "undefined") {
      key = field.fieldKey;
    }
    state[key] = {};
    state[key].hidden = field.hidden;
    state[key].enable = field.enable;
    state[key].options = field.options;
    if (field.formatIn !== undefined) {
      initData = field.formatIn(initData);
    }

    if (field.type === "object") {
      let childState = state[key];
      field.childFields.map((childField) => {
        let childInitData = initData[childField.fieldKey];
        let newParents = parents;
        newParents.push(childField.fieldKey);
        if (!_.isUndefined(childInitData))
          this.dataToState(newParents, childField, childInitData, childState);
        else if (!_.isUndefined(childField.default))
          this.dataToState(newParents, childField, childField.default, childState);
        else
          this.emptyDataToState(newParents, childField, childState);
      });
    }
    else if (field.type === "array") {
      state[key] = [];
      for (let k = 0; k < initData.length; k++) {
        let newParents = parents;
        newParents.push(k);
        this.dataToState(newParents, field.itemField, initData[k], state[key], k);
      }
    }
    else if (field.type === "files") {
      let fileObjects = initData;
      let baseUrl = field.baseUrl ? field.baseUrl : "";
      if (field.sourceField)
        state[key].preview = fileObjects.map((image) => (baseUrl + image[field.sourceField]));
      else
        state[key].preview = fileObjects.map((image) => (baseUrl + image));
      state[key].value = fileObjects;
      state[key][field.fileRemoveKey] = [];
    }
    else if (field.type === "file") {
      let baseUrl = field.baseUrl ? field.baseUrl : "";
      if (field.sourceField){
        state[key].preview = baseUrl + initData[field.sourceField];
      }else {
        state[key].preview = baseUrl + initData;
      }

      state[key].value = initData;
    }
    else if (field.type === "select") {
      //find right item in option
      let options = field.options;
      if (options.length > 0) {
        if (options[0].options !== undefined) {
          let tmpOptions = [];
          options.map((option) => {
            tmpOptions = tmpOptions.concat(option.options);
          })
          options = tmpOptions;
        }
      }
      if (field.multi) {
        let values = initData;
        state[key].selected = [];
        state[key].value = [];
        for (let i = 0; i < values.length; i++) {
          let value = values[i];
          let foundOption = options.find((option) => (option.value === value));
          if (!_.isUndefined(foundOption)) {
            state[key].selected.push(foundOption);
            state[key].value.push(foundOption.value);
          }
          else {
            console.error("Not find an option here");
          }
        }
      }
      else {
        let value = initData;
        let foundOption = options.find((option) => (option.value === value));
        if (_.isUndefined(foundOption)) {
          foundOption = "";
          console.error("Not find an option here");
        }
        state[key].selected = foundOption;
        state[key].value = foundOption.value;
      }
    }
    else {
      state[key].value = initData;
    }
    //update another

    if (!_.isUndefined(field.updateOther)) {
      this.otherUpdateFields.push({
        field, data: initData, parents
      });
    }
  }

  //update init data to state
  //for stateToData
  dataToStateSingle(parents, field, initDatas, state) {
    let initData;
    if (initDatas !== undefined) {
      initData = initDatas[field.fieldKey];
    }

    if (initData === undefined) {
      if (field.default !== undefined)
        initData = field.default;
    }

    if (!_.isUndefined(initData))
      this.dataToState(parents, field, initData, state);
    else
      this.emptyDataToState(parents, field, state);
  }

  dataToStateAll(parents, field, initDatas, state) {
    if (field instanceof Array) {
      field.map((childField) => {
        this.dataToStateAll(parents, childField, initDatas, state);
      });
    }
    else if (field.type === "group") {
      this.dataToStateSingle(parents, field, initDatas, state);
      field.childFields.map((childField) => {
        this.dataToStateAll(parents, childField, initDatas, state);
      });
    }
    else {
      //should remove object array from this case
      this.dataToStateSingle(parents, field, initDatas, state);
    }

  }

  updateState(draffState, props) {
    this.otherUpdateFields = [];

    let state = draffState;
    if (!_.isUndefined(props.initialData)) {
      state.fields.map((field) => {
        this.dataToStateAll([], field, props.initialData, state);
      });
    }
    else {
      state.fields.map((field) => {
        this.dataToStateAll([], field, undefined, state);
      });
    }

  }


  udpateRelateData(props) {
    //loop in fields
    //detect otherUpdateFields
    //udpate other field
  }

  //end region
  //convert rawdata to event data which will be return by view
  toEventData(rawData, field, state, parents, dynamicOptions) {
    //use dynamicOption or state to access dOptions
    //if provide state get dynamic options from state
    //otherwise dynamicOptions must be provide
    if (!_.isUndefined(state)) {
      state = this.getState(state, parents);
      dynamicOptions = state[field.fieldKey]
    }


    switch (field.type) {
      case "select":
        //find label
        let options = dynamicOptions.options;
        if (options.length > 0) {
          if (options[0].options !== undefined) {
            let tmpOptions = [];
            options.map((option) => {
              tmpOptions = tmpOptions.concat(option.options);
            })
            options = tmpOptions;
          }
        }

        if (field.multi) {
          let values = rawData;
          let selecteds = [];

          for (let i = 0; i < values.length; i++) {
            let value = values[i];
            let foundOption = options.find((option) => (option.value === value));
            if (!_.isUndefined(foundOption)) {
              selecteds.push(foundOption);
            }
          }
          return selecteds;
        }
        else {
          let foundOption = options.find((option) => (option.value === rawData));
          if (_.isUndefined(foundOption)) {
            foundOption = null;
          }
          return foundOption;
        }
        break;
      default:
        return rawData;
    }
  }

  //some field need to update base on another field update, called relate field
  updateRelateFieldsToState(draftState, props) {
    for (let i = 0; i < this.otherUpdateFields.length; i++) {
      let {data, field, parents} = this.otherUpdateFields[i];

      let {titleStyle, tooltipStyle, inputTextStyle} = props;
      let config = {titleStyle, tooltipStyle, inputTextStyle};
      field = addDefaultFieldPropSingle(field, config);
      //change data to event data
      let eventData = this.toEventData(data, field, draftState, parents);
      //get update fields
      let otherUpdateFields = field.updateOther(eventData);
      for (let i = 0; i < otherUpdateFields.length; i++) {
        let fieldUpdate = otherUpdateFields[i];
        let field = fieldUpdate.field;
        let parents = fieldUpdate.parents;
        //update dynamic options first
        this.onFieldUpdateDraft(draftState, fieldUpdate.value, field.fieldKey, fieldUpdate.parents, field, fieldUpdate.dynamicOptions);

        //re assign value to relate field with new options updated
        //get field value from data

        //first get init data from props
        let updateData;
        let initData = props.initialData;
        for (let i = 0; i < parents.length; i++) {
          initData = initData[parents[i]];
        }
        if (initData !== undefined)
          updateData = initData[field.fieldKey];

        //if initData is undefined, use default data
        if (updateData === undefined)
          updateData = field.default;

        let updateEventData = this.toEventData(updateData, field, undefined, parents, fieldUpdate.dynamicOptions);
        this.onFieldUpdateDraft(draftState, updateEventData, field.fieldKey, fieldUpdate.parents, field, undefined);
      }
    }
  }

  onFilesRemove(index, fieldName, parents, field) {

  }

  getState(state, parents) {
    for (let i = 0; i < parents.length; i++) {
      state = state[parents[i]];
    }
    return state;
  }

  //parents to access current array object
  //field is item field
  onArrayAdd(parents, field) {
    this.setState(produce(this.state, (draffState) => {

      let state = this.getState(draffState, parents);
      let key = state.length;
      if (field.default === undefined)
        this.emptyDataToState(parents, field, state, key);
      else
        this.dataToState(parents, field, field.default, state, key);


      /*let initItem = ""; //text select file
       switch (field.type) {
       case "files","array": {
       initItem = [];
       break;
       }
       default:{
       initItem = {};
       }
       }
       state.push(initItem);*/
    }));
  }

  onArrayRemove(index, parents, field) {
    this.setState(produce(this.state, (draffState) => {
      let state = this.getState(draffState, parents);
      //current state will point to array object
      state.splice(index, 1);
    }));
  }

  //handle field update with given draft state
  onFieldUpdateDraft(draffState, updated, fieldName, parents, field, dynamicOptions) {
    let state = this.getState(draffState, parents);
    if (!_.isUndefined(dynamicOptions)) {
      //update options
      Object.entries(dynamicOptions).map((pairs) => {
        state[fieldName][pairs[0]] = pairs[1];
      });
    }
    if (!_.isUndefined(updated)) {
      switch (field.type) {
        case "file": {
          this.fileChange(updated.acceptedFiles, updated.rejectedFiles, fieldName, state);
          break;
        }
        case "files": {
          this.filesChange(updated.acceptedFiles, updated.rejectedFiles, fieldName, state);
          break;
        }
        case "select" : {
          this.selectFieldChange(updated, fieldName, state);
          break;
        }
        case "array" : {
          //add empty item to array
          this.selectFieldChange(updated, fieldName, state);
          break;
        }
        default : {
          this.fieldChange(updated, fieldName, state);
        }
      }
    }

    //check if need to update other base on this change
    if (!_.isUndefined(field.updateOther)) {
      let otherUpdateFields = field.updateOther(updated);
      for (let i = 0; i < otherUpdateFields.length; i++) {
        let fieldUpdate = otherUpdateFields[i];
        let field = fieldUpdate.field;
        this.onFieldUpdateDraft(draffState, fieldUpdate.value, field.fieldKey, fieldUpdate.parents, field, fieldUpdate.dynamicOptions);
      }
    }
  }

  //handle update change in any field, use in renderHelper
  //use to update value or dynamic options
  onFieldUpdate(updated, fieldName, parents, field, dynamicOptions) {
    this.setState(state => produce(state, (draffState) => {
      this.onFieldUpdateDraft(draffState, updated, fieldName, parents, field, dynamicOptions)
    }));

  }


  //handle file field update
  fileChange(acceptedFiles, rejectedFiles, fieldName, state) {
    state[fieldName].preview = acceptedFiles[0].preview;
    state[fieldName].value = acceptedFiles[0];
  }


  //handle file array field remove
  filesRemove(index, fieldName, fieldFileRemove, parents) {
    this.setState(produce(this.state, (draffState) => {
      let state = this.getState(draffState, parents);

      //check if remove file is from server
      let removeFile = state[fieldName].value[index];
      let isFromServer = !(removeFile instanceof File);
      if (isFromServer) {
        state[fieldName][fieldFileRemove].push(removeFile);
      }
      state[fieldName].value.splice(index, 1)
      state[fieldName].preview.splice(index, 1);
    }));
  }


  //handle file array file update
  filesChange(acceptedFiles, rejectedFiles, fieldName, state) {
    //get list except from server ( non file mean from server )
    let existedModifeds = state[fieldName].value
      .filter((file) => (file instanceof File))
      .map((file) => (file.lastModified));

    acceptedFiles.map((file) => {
      if (!existedModifeds.includes(file.lastModified)) {
        state[fieldName].value.push(file);
        state[fieldName].preview.push(file.preview);
      }
    })
  }

  //handle select field change
  selectFieldChange(item, name, state) {
    state[name].selected = item;

    //check if select field is multi choose
    if (Array.isArray(item)) {
      state[name].value = item.map((it) => it.value);
    }
    else if (item !== null)
      state[name].value = item.value;
    else //nothing choosen
      state[name].value = "";
  }

  //default handle for field change , current will be text
  fieldChange(updated, fieldName, state) {
    state[fieldName].value = updated;
  }


  clearForm() {
    this.setState(produce(this.state, (draft) => {
      this.state.fields.map((field) => {
        this.dataToStateAll([], field, undefined, draft);
      });
    }));
  }

  //use to reset form to initial data.
  reset() {
    this.setState((state) => produce(state, (draft) => {
      this.updateState(draft, this.props);
    }));

  }


}

UncontrolForm.propTypes = {
  fields: PropTypes.array.isRequired,
  onSubmit: PropTypes.func,
  toastError: PropTypes.func,
  toastSuccess: PropTypes.func,
  submitable: PropTypes.bool,
  initialData: PropTypes.object,
  closeOnSubmit: PropTypes.bool,
  clearOnSubmit: PropTypes.bool,
  shouldValidate: PropTypes.bool,
  titleStyle: PropTypes.object,
  tooltipStyle: PropTypes.object,
  inputTextStyle: PropTypes.object,
}

UncontrolForm.defaultProps = {
  shouldValidate:false,
  closeOnSubmit: true,
  clearOnSubmit: true,
  submitable: true,
  onSubmit: () => {
  },
  toastError: () => {
  },
  toastSuccess: () => {
  },
  titleStyle: {},
  tooltipStyle: {},
  inputTextStyle: {}
}
const styles = {
  input: {
    margin: 5,
  },
  dropzone: {
    marginRight: 5,
    width: 170,
    height: 170,
    borderWidth: 2,
    borderColor: 'grey',
    borderStyle: "dashed",
    borderRadius: 5
  }
};


/*import Loadable from 'react-loadable';
import LoadingIndicator from 'components/LoadingIndicator';
export default Loadable({loading: LoadingIndicator, loader: () => UncontrolForm});*/

export default UncontrolForm;
