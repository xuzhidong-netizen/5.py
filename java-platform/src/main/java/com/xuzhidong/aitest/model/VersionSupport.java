package com.xuzhidong.aitest.model;

public class VersionSupport {
    private String versionName;
    private String versionNumber;
    private String funcNoString;
    private String sysId;
    private String sysName;
    private String runFlag;

    public VersionSupport() {
    }

    public VersionSupport(String versionName, String versionNumber, String funcNoString, String sysId, String sysName, String runFlag) {
        this.versionName = versionName;
        this.versionNumber = versionNumber;
        this.funcNoString = funcNoString;
        this.sysId = sysId;
        this.sysName = sysName;
        this.runFlag = runFlag;
    }

    public String getVersionName() {
        return versionName;
    }

    public void setVersionName(String versionName) {
        this.versionName = versionName;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(String versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getFuncNoString() {
        return funcNoString;
    }

    public void setFuncNoString(String funcNoString) {
        this.funcNoString = funcNoString;
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

    public String getRunFlag() {
        return runFlag;
    }

    public void setRunFlag(String runFlag) {
        this.runFlag = runFlag;
    }
}
