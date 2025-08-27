# Enhanced Student API with Flexible Filtering

## ✅ Updated Implementation

The Student API has been enhanced with flexible filtering parameters and Spring Boot validation:

### **New Flexible Parameters**

| Parameter | Type | Validation | Description | Example |
|-----------|------|------------|-------------|---------|
| `search` | String | - | Search across name, surname, email, phone, profession | `"john"` |
| `gender` | String | `@Pattern(regexp="^[MFO]$")` | Filter by gender | `"M"`, `"F"`, `"O"` |
| `profession` | String | - | Partial match on profession | `"engineer"` |
| `minAge` | Integer | `@Min(0)` `@Max(150)` | Minimum age filter | `18` |
| `maxAge` | Integer | `@Min(0)` `@Max(150)` | Maximum age filter | `65` |
| `startDate` | LocalDate | `@DateTimeFormat(ISO.DATE)` | Filter students created after this date | `"2023-01-01"` |
| `endDate` | LocalDate | `@DateTimeFormat(ISO.DATE)` | Filter students created before this date | `"2024-12-31"` |
| `includeInactive` | Boolean | - | Include soft-deleted students | `true`, `false` |
| `page` | Integer | Spring Data | Page number (0-based) | `0` |
| `size` | Integer | Spring Data | Page size | `20` |
| `sort` | String | Spring Data | Sort specification | `"name,asc"` |

### **Built-in Spring Validation**

#### **Automatic Validation Messages**
- ✅ **Gender validation**: Returns HTTP 400 if gender is not M, F, or O
- ✅ **Age range validation**: Ensures ages are between 0-150 and maxAge >= minAge
- ✅ **Date range validation**: Ensures endDate >= startDate
- ✅ **Date format validation**: Automatic parsing of ISO date format (YYYY-MM-DD)

#### **Custom Validation Logic**
```java
// Age range validation
if (minAge != null && maxAge != null && maxAge < minAge) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "Maximum age (%d) must be greater than or equal to minimum age (%d)");
}

// Date range validation
if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "End date (%s) must be after or equal to start date (%s)");
}
```

## API Usage Examples

### **Flexible Age Filtering**
```bash
# Students between 25 and 35 years old
GET /students?minAge=25&maxAge=35

# Students 40 years or older
GET /students?minAge=40

# Students under 30 years old
GET /students?maxAge=30

# Students exactly 25 years old
GET /students?minAge=25&maxAge=25
```

### **Flexible Date Range Filtering**
```bash
# Students registered in 2024
GET /students?startDate=2024-01-01&endDate=2024-12-31

# Students registered in the last 6 months
GET /students?startDate=2024-02-26

# Students registered before 2023
GET /students?endDate=2022-12-31

# Students registered in a specific month
GET /students?startDate=2024-03-01&endDate=2024-03-31

# Students registered this year (2025)
GET /students?startDate=2025-01-01&endDate=2025-12-31
```

### **Complex Filtering Examples**
```bash
# Male engineers between 30-40 years old registered in 2024
GET /students?gender=M&profession=engineer&minAge=30&maxAge=40&startDate=2024-01-01&endDate=2024-12-31

# Search for "maria" with age filter
GET /students?search=maria&minAge=25&maxAge=50

# Female students registered in the last year
GET /students?gender=F&startDate=2024-08-26

# All students (including inactive) with profession filter
GET /students?profession=doctor&includeInactive=true
```

### **Pagination Examples**
```bash
# First page with 10 items, sorted by name
GET /students?page=0&size=10&sort=name,asc

# Second page with default sorting
GET /students?page=1&size=20

# Search with pagination
GET /students?search=john&page=0&size=5&sort=createdAt,desc
```

## Error Handling Examples

### **Invalid Gender**
```bash
GET /students?gender=X
```
```json
{
  "timestamp": "2025-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Gender must be M, F, or O",
  "path": "/students"
}
```

### **Invalid Age Range**
```bash
GET /students?minAge=50&maxAge=30
```
```json
{
  "timestamp": "2025-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Maximum age (30) must be greater than or equal to minimum age (50)",
  "path": "/students"
}
```

### **Invalid Date Range**
```bash
GET /students?startDate=2024-06-01&endDate=2024-01-01
```
```json
{
  "timestamp": "2025-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "End date (2024-01-01) must be after or equal to start date (2024-06-01)",
  "path": "/students"
}
```

### **Invalid Age Value**
```bash
GET /students?minAge=200
```
```json
{
  "timestamp": "2025-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Minimum age must be 150 or less",
  "path": "/students"
}
```

### **Invalid Date Format**
```bash
GET /students?startDate=01/01/2024
```
```json
{
  "timestamp": "2025-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Failed to convert value of type 'java.lang.String' to required type 'java.time.LocalDate'",
  "path": "/students"
}
```

## Technical Implementation Details

### **Spring Boot Validation Features Used**
- `@Validated` on controller class
- `@Pattern` for regex validation (gender)
- `@Min` and `@Max` for numeric range validation
- `@DateTimeFormat` for automatic date parsing
- Custom validation in controller methods

### **Age Calculation Logic**
```java
// For minAge=25, maxAge=30 on date 2025-08-26
LocalDate currentDate = LocalDate.now(); // 2025-08-26

// maxAge filter: students born after 2025-08-26 - 30 years - 1 day = 1995-08-25
if (maxAge != null) {
    LocalDate minBirthDate = currentDate.minusYears(maxAge).minusDays(1);
    predicates.add(criteriaBuilder.greaterThan(root.get("birthDate"), minBirthDate));
}

// minAge filter: students born before or on 2025-08-26 - 25 years = 2000-08-26  
if (minAge != null) {
    LocalDate maxBirthDate = currentDate.minusYears(minAge);
    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("birthDate"), maxBirthDate));
}
```

### **Date Range Logic**
```java
// startDate=2024-01-01: students created >= 2024-01-01T00:00:00Z
if (startDate != null) {
    Instant startInstant = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startInstant));
}

// endDate=2024-12-31: students created < 2025-01-01T00:00:00Z (exclusive end)
if (endDate != null) {
    Instant endInstant = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
    predicates.add(criteriaBuilder.lessThan(root.get("createdAt"), endInstant));
}
```

## Benefits of the New Implementation

1. **Flexible Filtering**: Any age range and date range combinations
2. **Spring Boot Validation**: Built-in validation with clear error messages
3. **Type Safety**: LocalDate and Integer parameters with proper parsing
4. **Performance**: Database-level filtering using JPA Criteria API
5. **Future-Proof**: Works with any year, not limited to predefined values
6. **User-Friendly**: Clear error messages for invalid input
7. **Standards Compliance**: Uses ISO date format (YYYY-MM-DD)

The API now supports flexible, validated filtering with comprehensive error handling!
