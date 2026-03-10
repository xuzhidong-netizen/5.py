package com.xuzhidong.aitest.model;

import java.time.LocalDateTime;

public class AiCase {
    private Long id;
    private String sysId;
    private String sysName;
    private Long caseId;
    private String caseName;
    private String caseType;
    private String runFlag;
    private String caseKvBase;
    private String caseKvDynamic;
    private String caseExpectResult;
    private String caseCheckErrorNo;
    private String caseCheckFunction;
    private String caseRemark;
    private String funcNo;
    private String funcName;
    private String funcType;
    private String subFuncType;
    private String moduleName;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSysId() {
        return sysId;
    }

    public void setSysId(String sysId) {
        this.sysId = sysId;
    }

    public String getSysName() {
        return sysName;
    }

    public void setSysName(String sysName) {
        this.sysName = sysName;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public String getCaseName() {
        return caseName;
    }

    public void setCaseName(String caseName) {
        this.caseName = caseName;
    }

    public String getCaseType() {
        return caseType;
    }

    public void setCaseType(String caseType) {
        this.caseType = caseType;
    }

    public String getRunFlag() {
        return runFlag;
    }

    public void setRunFlag(String runFlag) {
        this.runFlag = runFlag;
    }

    public String getCaseKvBase() {
        return caseKvBase;
    }

    public void setCaseKvBase(String caseKvBase) {
        this.caseKvBase = caseKvBase;
    }

    public String getCaseKvDynamic() {
        return caseKvDynamic;
    }

    public void setCaseKvDynamic(String caseKvDynamic) {
        this.caseKvDynamic = caseKvDynamic;
    }

    public String getCaseExpectResult() {
        return caseExpectResult;
    }

    public void setCaseExpectResult(String caseExpectResult) {
        this.caseExpectResult = caseExpectResult;
    }

    public String getCaseCheckErrorNo() {
        return caseCheckErrorNo;
    }

    public void setCaseCheckErrorNo(String caseCheckErrorNo) {
        this.caseCheckErrorNo = caseCheckErrorNo;
    }

    public String getCaseCheckFunction() {
        return caseCheckFunction;
    }

    public void setCaseCheckFunction(String caseCheckFunction) {
        this.caseCheckFunction = caseCheckFunction;
    }

    public String getCaseRemark() {
        return caseRemark;
    }

    public void setCaseRemark(String caseRemark) {
        this.caseRemark = caseRemark;
    }

    public String getFuncNo() {
        return funcNo;
    }

    public void setFuncNo(String funcNo) {
        this.funcNo = funcNo;
    }

    public String getFuncName() {
        return funcName;
    }

    public void setFuncName(String funcName) {
        this.funcName = funcName;
    }

    public String getFuncType() {
        return funcType;
    }

    public void setFuncType(String funcType) {
        this.funcType = funcType;
    }

    public String getSubFuncType() {
        return subFuncType;
    }

    public void setSubFuncType(String subFuncType) {
        this.subFuncType = subFuncType;
    }

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
