package com.xuzhidong.aitest.ai.service;

import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ApiParamDTO;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApiDocumentExcelService {

    private static final String[] HEADERS = {
        "接口名称",
        "接口路径",
        "请求方法",
        "请求参数名称",
        "请求参数类型",
        "是否必填",
        "默认值",
        "返回字段",
        "返回类型",
        "返回说明"
    };

    public byte[] exportDefinitions(List<ApiDefinitionDTO> definitions) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("接口文档");
            createHeaderRow(workbook, sheet);

            int rowIndex = 1;
            for (ApiDefinitionDTO definition : safeDefinitions(definitions)) {
                List<ApiParamDTO> requestParams = safeParams(definition.getRequestParams());
                List<ApiParamDTO> responseParams = safeParams(definition.getResponseParams());
                int maxRows = Math.max(Math.max(requestParams.size(), responseParams.size()), 1);
                for (int i = 0; i < maxRows; i++) {
                    ApiParamDTO request = i < requestParams.size() ? requestParams.get(i) : null;
                    ApiParamDTO response = i < responseParams.size() ? responseParams.get(i) : null;
                    Row row = sheet.createRow(rowIndex++);
                    writeCell(row, 0, valueOrDefault(definition.getApiName(), ""));
                    writeCell(row, 1, valueOrDefault(definition.getApiPath(), ""));
                    writeCell(row, 2, valueOrDefault(definition.getMethod(), ""));
                    writeCell(row, 3, valueOrDefault(request == null ? "" : request.getName(), ""));
                    writeCell(row, 4, valueOrDefault(request == null ? "" : request.getType(), ""));
                    writeCell(row, 5, request == null ? "" : (Boolean.TRUE.equals(request.getRequired()) ? "Yes" : "No"));
                    writeCell(row, 6, valueOrDefault(request == null ? "" : request.getExample(), "N/A"));
                    writeCell(row, 7, valueOrDefault(response == null ? "" : response.getName(), ""));
                    writeCell(row, 8, valueOrDefault(response == null ? "" : response.getType(), ""));
                    writeCell(row, 9, valueOrDefault(response == null ? "" : response.getDescription(), ""));
                }
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("生成接口文档Excel失败", ex);
        }
    }

    private void createHeaderRow(Workbook workbook, Sheet sheet) {
        Row header = sheet.createRow(0);
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(HEADERS[i]);
            cell.setCellStyle(style);
        }
    }

    private void writeCell(Row row, int index, String value) {
        row.createCell(index).setCellValue(valueOrDefault(value, ""));
    }

    private List<ApiDefinitionDTO> safeDefinitions(List<ApiDefinitionDTO> definitions) {
        return definitions == null ? List.of() : definitions;
    }

    private List<ApiParamDTO> safeParams(List<ApiParamDTO> params) {
        return params == null ? new ArrayList<>() : params;
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
