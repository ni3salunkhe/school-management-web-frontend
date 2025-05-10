package com.api.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.YearMonth;
import java.sql.Date;

@Converter(autoApply = true)
public class YearMonthAttributeConverter implements AttributeConverter<YearMonth, String> {

    @Override
    public String convertToDatabaseColumn(YearMonth attribute) {
        return (attribute == null ? null : attribute.toString());
    }

    @Override
    public YearMonth convertToEntityAttribute(String dbData) {
        return (dbData == null ? null : YearMonth.parse(dbData));
    }
}
