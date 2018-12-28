/**
 * Created by kduyi on 17-Jun-18.
 */

import React, {Component} from 'react';
import Select, {components} from 'react-select';
import {
  Card, CardBody, Input, InputGroup, InputGroupAddon, InputGroupText,
} from "reactstrap";


import _ from "lodash";
import Dropzone from "react-dropzone";
import DivVer from "../components/DivVer/index";
import DivHoz from "../components/DivHoz/index";
import HozItem from "../components/HozScroll/HozItem";
import HozScroll from "../components/HozScroll/index";
import PrimaryLabel from "../components/PrimaryLabel/index";
import {COLOR as COLORS} from "../../constant/color";
import {InputAdapter, TextMask} from "react-text-mask-hoc";

export var CONFIG = {
  version: 2,
  marginHorizontal: 4,
  groupTitleV2MarginBottom: 10,
}

export function mergeConfig(addConfig) {
  if(addConfig){
    CONFIG = {...CONFIG,...addConfig};
    console.log("MERGE CONFIG",CONFIG)
  }

}
//render single field
const renderCustom = (field, comp, conditionStyle, parents, state, key) => {
  /*for (let i = 0; i < parents.length; i++) {
   state = state[parents[i]];
   }*/
  let onChange;
  let {hiddenStyle, disableStyle} = conditionStyle;
  if (field.enable) {
    onChange = comp.onFieldUpdate;
  }else {
    onChange = () => {
    };
  }
  return (
    <DivVer key={field.fieldKey} className="mb-2" style={{...disableStyle, ...hiddenStyle, ...{flex: field.flex}}}>
      {renderTitle(field,false,false)}
      {field.formFormat ? <Card className="m-0 p-0" style={{backgroundColor: COLORS.grey["50"]}}>
        <CardBody className="m-0 p-1 pl-2">
          {field.formFormat(state[key].value,(value)=>{
            onChange(value, key, parents, field);
          },comp.props.shouldValidate)}
        </CardBody>
      </Card> : null}

    </DivVer>)
}

export const renderSelectOption = (renderer, innerProps, isDisabled, isOption, isMulti) => {
  let data = innerProps.data;
  let WrapComp;
  if (isOption) {
    WrapComp = components.Option;
  }
  else if (!isMulti)
    WrapComp = components.SingleValue;
  else
    WrapComp = components.MultiValue;
  //return <components.Option {...innerProps}/>
  return <WrapComp {...innerProps}>
    {renderer(data)}
  </WrapComp>
}

function isAssigned(value) {
  if(_.isNumber(value))
    return true;
  if(_.isBoolean(value))
    return true;
  return !_.isEmpty(value);
}

const renderSelect = (field, comp, conditionStyle, parents, state, key, isVertically) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  let options = state[key].options;
  const selectValue = state[key].value;
  const isEmpty = !isAssigned(selectValue);
  const isInvalid = comp.props.shouldValidate && (isEmpty && field.required && field.options.length > 0);

  const marginStyle = isVertically ? {} : {marginRight: CONFIG.marginHorizontal, marginLeft: CONFIG.marginHorizontal};
  const style = {...disableStyle, ...hiddenStyle, ...{flex: field.flex},...field.style};
  console.log("style", style);

  let validateStyle = {};
  let dropDownValidateStyle = {};
  console.log("disableStyle", disableStyle);
  let dropdownIndicatorStyle, indicatorSeparatorStyle,optionStyle;

  if (isInvalid) {
    validateStyle = CONFIG.version===1?{
      '&:hover': {
        border: "2px solid crimson",
      },
      border: "1px solid red",
    }:{
      '&:hover': {
        borderColor: "crimson",
        borderBottom: "2px solid crimson",
      },
      borderColor: "red",
      borderBottom: "1px solid red",
    };

    dropDownValidateStyle = {
      '&:hover': {color: 'crimson'},
      color: "red"
    }
  }

  if (field.noDropdown) {
    dropdownIndicatorStyle = (provided, state) => ({
      ...provided,
      display: "none",
      width: 0,
      height: 0,
    });
    indicatorSeparatorStyle = (provided, state) => ({
      ...provided,
      display: "none",
      width: 0,
      height: 0,
    });
    optionStyle= CONFIG.version===1?(provided, state) => ({
      ...provided,
    }):(provided, state) => ({
      ...provided,
      paddingLeft:2,
      paddingRight:2,
      marginLeft:0,
      marginRight:0,
    });
  } else {
    dropdownIndicatorStyle = (provided, state) => ({
      ...provided,
      color: "darkgray",
      '&:hover': {color: 'darkgray'},
      ...dropDownValidateStyle
    });
    indicatorSeparatorStyle = (provided, state) => ({
      ...provided,
    });
    optionStyle= (provided, state) => ({
      ...provided,
    });
  }


  let controlStyle = field.bottomMode?{
    '&:hover': {
      borderColor: 'darkgray',
      borderBottom: "2px solid darkgray",
    },
    outline: 0,
    border: 0,
    boxShadow: "0",
    backgroundColor: "transparent",
    borderRadius: 0,
    borderBottom: "1px solid darkgray",
    borderColor:"red",
  }:{}

  if(CONFIG.version === 2){
    controlStyle.minHeight="30px !important";
    controlStyle.height="30px !important";
    controlStyle.maxHeight="30px !important";
  }


  const valueStyle = CONFIG.version === 2?(provided, state) => ({
    ...provided,
    paddingLeft:0,
    marginLeft:0,
    paddingRight:0,
    marginRight:0,
  }):(provided, state) => ({
    ...provided,
  });
  console.log("VALUE STYLE",valueStyle);

  return <DivVer key={field.fieldKey} style={style} className="mb-3">
    {renderTitle(field, isInvalid,field.noDropdown)}
    <Select
      styles={{
        option: optionStyle,
        dropdownIndicator: dropdownIndicatorStyle,
        indicatorSeparator: indicatorSeparatorStyle,
        control: (provided, state) => ({
          ...provided,
          ...controlStyle,
          ...validateStyle
        }),
        valueContainer: valueStyle,

      }}
      key={key}
      placeholder={field.placeholder}
      searchable={true}
      value={state[key].selected}
      options={options}
      onChange={(v) => comp.onFieldUpdate(v, key, parents, field)}

      components={field.itemRenderer !== undefined ? {
        Option: (p, d) => renderSelectOption(field.itemRenderer, p, d, true),
        SingleValue: (p, d) => renderSelectOption(field.valueRenderer?field.valueRenderer:field.itemRenderer, p, d, false, false),
        MultiValue: (p, d) => renderSelectOption(field.valueRenderer?field.valueRenderer:field.itemRenderer, p, d, false, true),
      } : undefined}

      valueRenderer={field.itemRenderer}
      optionRenderer={field.itemRenderer}
      isMulti={field.multi}
    />
  </DivVer>
}

function renderPrepend(prependData) {
  return prependData !== undefined ? <InputGroupAddon addonType="prepend">
    {renderExtraContent(prependData)}
  </InputGroupAddon> : null
}

function renderAppend(appendData) {
  return appendData !== undefined ? <InputGroupAddon addonType="append">
    {renderExtraContent(appendData)}
  </InputGroupAddon> : null
}

function renderExtraContent(data) {
  if (typeof data === "string") {
    //text
    return <InputGroupText>{data}</InputGroupText>
  }
  else if (data instanceof Component) {
    //custom component
    return data;
  }
  else if (data instanceof Object) {
    //mean icon
    return <InputGroupText>
      <i style={{width: 18}} className={data.icon}></i>
    </InputGroupText>
  }
}

function renderTooltip(field, key) {
  return null;
  /*return field.tooltip !== undefined?<Tooltip isOpen={true} delay={0} placement={field.tooltipPosition} target={field.fieldKey + key + "Tooltip"}>
      <div >{field.tooltip}</div>
  </Tooltip>:null*/
}

const renderEditTextV1 = (field, comp, conditionStyle, parents, state, key,isVertically) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  let value, onChange;

  if (!_.isUndefined(field.formFormat)) {
    value = field.formFormat(state[key].value);
  }
  else {
    value = state[key].value;
  }

  if (field.enable) {
    onChange = comp.onFieldUpdate;
  }else {
    onChange = () => {
    };
  }


  const isInValid = comp.props.shouldValidate && (value.length === 0 && field.required);
  console.log("isInValid",isInValid,value,field.required,comp.props.shouldValidate);
  const layoutStyle = isVertically?{alignSelf: "stretch"}:{alignSelf: "stretch",flex: field.flex}
  return <DivVer key={field.fieldKey} style={{...hiddenStyle, ...layoutStyle,...field.style}}>
    {renderTooltip(field, key)}
    {renderTitle(field,isInValid,CONFIG.version === 2)}
    {field.type !== "textarea" ? <InputGroup
        id={field.fieldKey + key + "Tooltip"}
        key={key}
        className="mb-3">
        {renderPrepend(field.prepend)}
        {typeof field.mask === "undefined"
          ? <Input name={key} value={value} type={field.type}
                   className={isInValid ? "text-input-v1 text-input-invalid-v1" : "text-input-v1"}
                   style={{...disableStyle, ...field.inputTextStyle}}
                   placeholder={field.placeholder}
                   onChange={(e) => onChange(e.target.value, key, parents, field)}/>
          : <TextMask invalid={isInValid}
                      className={isInValid ? "input-invalid-text form-control" : "form-control"}
                      style={disableStyle}
                      name={key}
                      value={value} type={field.type}
                      placeholder={field.placeholder} onChange={(e) => onChange(e.target.value, key, parents, field)}
                      mask={field.mask}
                      Component={InputAdapter}
          />}
        {renderAppend(field.append)}
      </InputGroup>
      : <Input type="textarea"
               invalid={isInValid}
               className={isInValid ? "textarea-input-v1 invalid-textarea-input-v1 mb-2" : "textarea-input-v1 mb-2"}
               rows="5"
               id={field.fieldKey + key + "Tooltip"}
               key={key}
               value={value}
               style={{background: COLORS.grey["100"]}}
               onChange={(e) => onChange(e.target.value, key, parents, field)}
               placeholder={field.placeholder}/>}
  </DivVer>
}

const renderEditTextV2 = (field, comp, conditionStyle, parents, state, key, isVertically) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  let value, onChange;
  if (field.enable) {
    if (!_.isUndefined(field.formFormat)) {
      value = field.formFormat(state[key].value);
    }
    else {
      value = state[key].value;
    }
    onChange = comp.onFieldUpdate;
  }
  else {
    if (!_.isUndefined(field.formFormat)) {
      value = field.formFormat(state[key].value);
    }
    else {
      value = state[key].value;
    }
    onChange = () => {
    };
  }
  const isInValid = comp.props.shouldValidate && (value.length === 0 && field.required);
  const marginStyle = isVertically ? {} : {marginRight: CONFIG.marginHorizontal, marginLeft: CONFIG.marginHorizontal};
  const layoutStyle = isVertically?{alignSelf: "stretch"}:{alignSelf: "stretch",flex: field.flex}
  return <DivVer key={field.fieldKey} style={{...hiddenStyle, ...layoutStyle,...field.style}}>
    {renderTooltip(field, key)}
    {renderTitle(field, isInValid,true)}
    {field.type !== "textarea" ?
      (typeof field.mask === "undefined"
        ? <input id={field.fieldKey + key + "Tooltip"}
                 key={key}
                 name={key} value={value} type={field.type}
                 invalid={isInValid}
                 className={isInValid ? "mb-3 text-input-v2 invalid-text-input-v2" : "mb-3 text-input-v2"}
                 style={{...disableStyle, ...field.inputTextStyle}}
                 placeholder={field.placeholder}
                 onChange={(e) => onChange(e.target.value, key, parents, field)}/>
        : <TextMask invalid={isInValid}
                    className={isInValid ? "input-invalid-text form-control" : "form-control"}
                    style={disableStyle}
                    name={key}
                    value={value} type={field.type}
                    placeholder={field.placeholder} onChange={(e) => onChange(e.target.value, key, parents, field)}
                    mask={field.mask}
                    Component={InputAdapter}
        />)
      : <Input type="textarea"
               invalid={isInValid}
               className={isInValid ? "textarea-input-v2 invalid-textarea-input-v2 mb-2" : "textarea-input-v2 mb-2"}
               rows="5"
               id={field.fieldKey + key + "Tooltip"}
               key={key}
               value={value}
               style={{background: COLORS.grey["100"],marginTop:5}}
               onChange={(e) => onChange(e.target.value, key, parents, field)}
               placeholder={field.placeholder}/>}
  </DivVer>
}

function renderTitle(field, isInvalid = false, lowMarginBottom = true) {
  let className;
  if(CONFIG.version === 1){
    className = !isInvalid ? "my-title-v1" : "my-invalid-title-v1 my-title-v1 ";
  }else {
    className = !isInvalid ? "my-title-v2" : "my-invalid-title-v2 my-title-v2 ";
  }
  if(!lowMarginBottom){
    className+= " my-extra-margin-for-title";
  }

  return field.title !== undefined ?
    <PrimaryLabel className={className} style={field.titleStyle}>{field.title}</PrimaryLabel> : null;
}

function renderGroupTitle(field, isInvalid = false) {
  let className;
  if(CONFIG.version === 1){
    className = !isInvalid ? "my-title-v1  my-group-title-v1" : "my-invalid-title-v1 my-title-v1 my-group-title-v1";
  }else {
    className = !isInvalid ? "my-title-v2  my-group-title-v2" : "my-invalid-title-v2 my-title-v2 my-group-title-v2";
  }
  return field.title !== undefined ?
    <PrimaryLabel className={className} style={field.titleStyle}>{field.title}</PrimaryLabel> : null;
}

const renderFile = (field, comp, conditionStyle, parents, state, key) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  return <DivVer key={field.fieldKey} style={{...disableStyle, ...hiddenStyle}} className="mb-2">
    {renderTitle(field,false,false)}
    <Dropzone style={{...styles.dropzone, ...field.additionImageStyle}}
              onDrop={(f, r) => comp.onFieldUpdate({acceptedFiles: f, rejectedFiles: r}, key, parents, field)}>
      <DivVer style={{
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}>
        <img src={state[key].preview} style={{maxWidth: "100%", maxHeight: "100%"}}/>
      </DivVer>
    </Dropzone>
  </DivVer>
}

const renderFiles = (field, comp, conditionStyle, parents, state, key) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  return <DivVer key={field.fieldKey} className="mb-2" style={hiddenStyle}>
    {renderTitle(field,false,false)}
    <HozScroll style={{display: "flex", overflowX: "scroll", width: "100%"}}>
      <HozItem key="-1" style={disableStyle}>
        <Dropzone multiple style={{...styles.dropzone, ...field.additionImageStyle}}
                  onDrop={(f, r) => comp.onFieldUpdate({
                    acceptedFiles: f,
                    rejectedFiles: r
                  }, key, parents, field)}>
          <DivVer style={{
            position: "relative",
            alignItems: "center", justifyContent: "center",
            width: "100%",
            height: "100%"
          }}>
            <i className="fa fa-plus fa-4x"></i>
          </DivVer>
        </Dropzone>
      </HozItem>
      {state[key].preview.map((url, index) => (
        <HozItem key={index} style={{...styles.li, ...disableStyle}}>
          <DivVer style={{...styles.dropzone, ...{position: "relative"}}}>
            <i onClick={() => comp.filesRemove(index, key, field.fileRemoveKey, parents)}
               style={{top: 0, right: 0, alignSelf: "flexStart", color: 'red', fontSize: 30}}
               className="fa fa-remove red position-absolute"></i>
            <img src={url} style={{maxWidth: "100%", maxHeight: "100%"}}/>
          </DivVer>
        </HozItem>
      ))}
    </HozScroll>

  </DivVer>
}

const renderSingleItem = (field, comp, conditionStyle, parents, state, key, isVertically) => {

  if (field.type === "custom") {
    return renderCustom(field, comp, conditionStyle, parents, state, key, isVertically);
  }
  else if (field.type === "file") {
    return renderFile(field, comp, conditionStyle, parents, state, key, isVertically);
  }
  else if (field.type === "files") {
    return renderFiles(field, comp, conditionStyle, parents, state, key, isVertically);
  }
  else if (field.type === "select")
    return renderSelect(field, comp, conditionStyle, parents, state, key, isVertically);
  else {
    console.log("CONFIG",CONFIG);
    let renderEditText = CONFIG.version === 1 ? renderEditTextV1 : renderEditTextV2;
    return renderEditText(field, comp, conditionStyle, parents, state, key, isVertically);
  }

}

export const renderField = (field, comp, parents = [], key, isVertically) => {
  if (typeof key === "undefined")
    key = field.fieldKey;

  let state = comp.state;
  for (let i = 0; i < parents.length; i++) {
    state = state[parents[i]];
  }

  let disableS = {pointerEvents: "none", disabled: true, opacity: 0.8};
  let hiddenStyle = state[key].hidden ? {display:"none", overflow: "hidden"} : {}
  let isDisableStyle = !state[key].enable ? disableS : {};
  let disableStyle = {...isDisableStyle, ...{alignItems: "stretch"}}
  let conditionStyle = {hiddenStyle, disableStyle}
  if (field.type === "array") {
    return renderList(field, comp, conditionStyle, parents, state, key, isVertically);
  }
  else if (field.type === "object") {
    return renderObject(field, comp, conditionStyle, parents, state, key, isVertically);
  }
  else if (field.type === "group") {
    return renderGroup(field, comp, conditionStyle, parents, state, key, isVertically);
  }
  else
    return renderSingleItem(field, comp, conditionStyle, parents, state, key, isVertically);
}

//render group field

//List contain with same format
const renderList = (field, comp, conditionStyle, parents, state, key, isVertically) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  let newParents = parents.map(i => i);
  newParents.push(key);

  let arrayItems = state[key];
  let items = [];
  for (let i = 0; i < arrayItems.length; i++) {
    items.push(<DivHoz key={i} className="align-self-stretch">
      {renderFieldAll(field.itemField, comp, newParents, i, isVertically)}
      <i onClick={() => comp.onArrayRemove(i, newParents, field)}
         style={{marginLeft: 10, paddingTop: 10, color: 'red', fontSize: 20}}
         className="fa fa-minus-circle red"/>
    </DivHoz>);
  }
  let empty = <div className="ml-2">There is no items yet</div>;

  return <DivVer key={field.fieldKey} className="mb-3" style={{...disableStyle, ...hiddenStyle}}>
    <DivHoz style={{marginBottom: 5, alignItems: "center"}}>
      {renderTitle(field,false,false)}
      <i style={{fontSize: 20, marginLeft: 10}} onClick={() => {
        comp.onArrayAdd(newParents, field.itemField)
      }} className="fa fa-plus-circle"/>
    </DivHoz>
    {items.length > 0 ? <Card className="m-0 p-0" style={{backgroundColor: COLORS.grey["50"]}}>
      <CardBody className="pt-3 px-3 mb-0 pb-0" style={{backgroundColor: COLORS.grey["50"]}}>
        <DivVer className="align-items-stretch">
          {items}
        </DivVer>
      </CardBody>
    </Card> : empty}
  </DivVer>
}

//object contain child with key:String, value:field ( canbe any type)
//child data will be hold in object key
export const renderObject = (field, comp, conditionStyle, parents, state, key, isVertically) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  let newParents = parents.map(i => i);
  newParents.push(key);
  return <DivVer key={field.fieldKey} className="mb-3"
                 style={{...disableStyle, ...hiddenStyle, ...{alignItems: "stretch", flex: field.flex}}}>
    {renderGroupTitle(field)}
    <Card className="m-0 p-0" style={{backgroundColor: COLORS.grey["50"], flex: 1}}>
      <CardBody className="pt-3 px-3 mb-0 pb-0" style={{backgroundColor: COLORS.grey["50"]}}>
        {field.childFields.map((childField) => {
          return renderFieldAll(childField, comp, newParents, undefined, isVertically);
        })}
      </CardBody>
    </Card>
  </DivVer>
}

//group contain many field, visual like object but child data will be populate to parent
export const renderGroup = (field, comp, conditionStyle, parents, state, key, isVertically) => {
  let {hiddenStyle, disableStyle} = conditionStyle;
  let className;
  if(CONFIG.version === 1){
    className = "my-group-body-v1";
  }else {
    className = "my-group-body-v2";
  }
  return <DivVer key={field.fieldKey} className="mb-3 my-card-shadow"
                 style={{...{alignItems: "stretch", flex: field.flex}, ...hiddenStyle}}>
    {CONFIG.version === 1 ? renderTitle(field,false,false) : null}
    <Card className="m-0 p-0" style={{backgroundColor: COLORS.grey["50"], flex: 1}}>
      <CardBody className={className}>
        {renderGroupTitle(field, false)}
        {field.childFields.map((childField) => {
          return renderFieldAll(childField, comp, parents, undefined, true);
        })}
      </CardBody>
    </Card>
  </DivVer>
}


//isVertically true vertical, false horizontal
const renderFieldAll = (field, comp, parents, key, isVertically) => {
  if (field instanceof Array)
  //array contain many field, will be render in inverted parent isVertically
    return renderFields(field, comp, parents, !isVertically);
  else
    return renderField(field, comp, parents, key, isVertically);
}

export const renderFields = (fields, comp, parents, isVertically = true) => {
  let childs = fields.map((field) => {
    return renderFieldAll(field, comp, parents, undefined, isVertically);
  });
  //todo adjust key to unique
  let key = "array" + fields.length;
  const arrayClass = isVertically ? "my-array-body-ver" : "my-array-body-hoz"
  if (isVertically) {
    return <DivVer key={key} style={{alignItems: "stretch", flex: 1}}
                   className={"p-0 align-content-center " + arrayClass}>
      {childs}
    </DivVer>
  } else {
    return <DivHoz key={key} className={arrayClass}>
      {childs}
    </DivHoz>
  }
}

const styles = {
  input: {
    margin: 5,
  },
  dropzone: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    width: 170,
    height: 170,
    borderWidth: 2,
    borderColor: 'grey',
    borderStyle: "dashed",
    borderRadius: 5
  },
  li: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
};





