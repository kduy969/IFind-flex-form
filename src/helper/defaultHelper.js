import * as _ from "lodash";
import {CONFIG} from "./renderHelper";

export function addDefaultFieldsProp(fields, config) {
  fields.map((field) => {
    addDefaultFieldPropSingle(field, config);
  });

  return fields;
}

let defaultFieldProps = {
  style:{},
  forceSubmitWhenDisable:false,
  formStyle:2,
  flex:1,
  hidden: false,
  isValid:true,
  enable: true, // enable to user interaction
  required: true,
  isKey: false, //key mean not editable, insertable but still show up
  isEmail: false,
  isNumber: false,
  submitable: true, //this field will be add to submit data
  fieldName: "", //for showing purpose can contain space
  placeholder: "",
  tooltipPosition: "right",
  typeHint: "",
  additionImageStyle:{},
  titleStyle: {},
  tooltipStyle: {},
  inputTextStyle: {},
  noDropdown:false,
  bottomMode:false,
}

let defaultFieldFollowProps = {
  fieldKey: "name",
  typeHint: "type",
  submitKey:"fieldKey"
}

const autoPreset1FieldFollowPropsV1 = {
  prepend: "fieldName",
}

const autoPreset1FieldFollowPropsV2 = {
  title: "fieldName",
}

const autoPreset2FieldFollowPropsV1 ={
  append: "fieldName",
  placeholder: "fieldName",
}
const autoPreset2FieldFollowPropsV2 = {
  title:"fieldName",
  append: "fieldName",
}

const autoPreset3FieldFollowPropsV1 = {
  append: "fieldName",
}

const autoPreset3FieldFollowPropsV2 = {
  title: "fieldName",
}

const autoPreset4FieldFollowProps = {
  title: "fieldName",
}

export function addDefaultFieldPropSingle(field, config) {
  if (field instanceof Array) {
    field.map((childField) => {
      addDefaultFieldPropSingle(childField, config);
    })
    return field;
  }

  if (field.preset !== undefined) {
    let autoFieldFollowProps = {};
    switch (field.preset) {
      case 1:
        autoFieldFollowProps = CONFIG.version === 1?autoPreset1FieldFollowPropsV1:autoPreset1FieldFollowPropsV2;;
        break;
      case 2:
        autoFieldFollowProps = CONFIG.version === 1?autoPreset2FieldFollowPropsV1:autoPreset2FieldFollowPropsV2;
        break;
      case 3:
        autoFieldFollowProps = CONFIG.version === 1?autoPreset3FieldFollowPropsV1:autoPreset3FieldFollowPropsV2;;
        break;
      case 4:
        autoFieldFollowProps = autoPreset4FieldFollowProps;
        break;

    }
    Object.entries(autoFieldFollowProps).map((pairs) => {
      let targetPropKey = pairs[0];
      let followPropKey = pairs[1];
      if (typeof field[targetPropKey] === "undefined") {
        field[targetPropKey] = field[followPropKey];
      }
    });
  }

  //merge config to default props
  //any property define in config will be add to default props of all field
  Object.entries({...defaultFieldProps, ...config}).map((pairs) => {
    let key = pairs[0];
    let value = pairs[1];
    if (typeof field[key] === "undefined") {
      field[key] = value;
    }
  });

  Object.entries(defaultFieldFollowProps).map((pairs) => {
    let targetPropKey = pairs[0];
    let followPropKey = pairs[1];
    if (typeof field[targetPropKey] === "undefined") {
      field[targetPropKey] = field[followPropKey];
    }
  });

  if (field.type === "array") {
    addDefaultFieldPropSingle(field.itemField, config);
  }
  else if (field.type === "object") {
    field.childFields.map((childField) => {
      addDefaultFieldPropSingle(childField, config);
    })
  }
  else if (field.type === "group") {
    field.childFields.map((childField) => {
      addDefaultFieldPropSingle(childField, config);
    })
  }
  return field;
}