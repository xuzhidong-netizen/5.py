package com.xuzhidong.aitest.ai.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

public class ApiDefinitionDTO {

    @NotBlank
    private String apiName;

    @NotBlank
    private String apiPath;

    @NotBlank
    private String method;

    private List<ApiParamDTO> requestParams = new ArrayList<>();
    private List<ApiParamDTO> responseParams = new ArrayList<>();

    public String getApiName() {
        return apiName;
    }

    public void setApiName(String apiName) {
        this.apiName = apiName;
    }

    public String getApiPath() {
        return apiPath;
    }

    public void setApiPath(String apiPath) {
        this.apiPath = apiPath;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public List<ApiParamDTO> getRequestParams() {
        return requestParams;
    }

    public void setRequestParams(List<ApiParamDTO> requestParams) {
        this.requestParams = requestParams == null ? new ArrayList<>() : requestParams;
    }

    public List<ApiParamDTO> getResponseParams() {
        return responseParams;
    }

    public void setResponseParams(List<ApiParamDTO> responseParams) {
        this.responseParams = responseParams == null ? new ArrayList<>() : responseParams;
    }
}
