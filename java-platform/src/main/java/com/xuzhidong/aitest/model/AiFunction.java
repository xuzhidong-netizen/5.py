package com.xuzhidong.aitest.model;

import java.time.LocalDateTime;

public class AiFunction {
    private Long id;
    private String sysId;
    private String sysName;
    private String funcNo;
    private String funcName;
    private String funcType;
    private String subFuncType;
    private String funcParamMatch;
    private String funcHttpUrl;
    private String funcRequestMethod;
    private String funcRemark;
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

    public String getFuncParamMatch() {
        return funcParamMatch;
    }

    public void setFuncParamMatch(String funcParamMatch) {
        this.funcParamMatch = funcParamMatch;
    }

    public String getFuncHttpUrl() {
        return funcHttpUrl;
    }

    public void setFuncHttpUrl(String funcHttpUrl) {
        this.funcHttpUrl = funcHttpUrl;
    }

    public String getFuncRequestMethod() {
        return funcRequestMethod;
    }

    public void setFuncRequestMethod(String funcRequestMethod) {
        this.funcRequestMethod = funcRequestMethod;
    }

    public String getFuncRemark() {
        return funcRemark;
    }

    public void setFuncRemark(String funcRemark) {
        this.funcRemark = funcRemark;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
