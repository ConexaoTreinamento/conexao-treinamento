# Complete Student API with Full Filtering

## ✅ Fully Implemented Features

### **Comprehensive Filtering System**
- ✅ **Search**: Case-insensitive search across name, surname, email, phone, and profession
- ✅ **Gender Filter**: Exact match filtering by gender (M, F, O)
- ✅ **Age Range Filter**: Dynamic age calculation with predefined ranges
- ✅ **Profession Filter**: Case-insensitive partial matching
- ✅ **Join Period Filter**: Date-based filtering by registration period
- ✅ **Include Inactive**: Optional inclusion of soft-deleted students
- ✅ **Pagination**: Full Spring Data JPA pagination with sorting
- ✅ **Input Validation**: Proper error messages for invalid parameters

### **Error Handling**
- ✅ **Invalid Gender**: Returns HTTP 400 with meaningful error message
- ✅ **Invalid Age Range**: Returns HTTP 400 with valid options listed
- ✅ **Invalid Join Period**: Returns HTTP 400 with valid options listed

## API Usage

### Complete Filter Examples

```bash
# Basic pagination
GET /students?page=0&size=20

# Search functionality
GET /students?search=john&page=0&size=10

# Gender filtering
GET /students?gender=M&page=0&size=20

# Age range filtering  
GET /students?ageRange=26-35&page=0&size=20

# Profession filtering
GET /students?profession=engineer&page=0&size=20

# Join period filtering
GET /students?joinPeriod=2024&page=0&size=20

# Include inactive students
GET /students?includeInactive=true&page=0&size=20

# Complex combined filtering
GET /students?search=john&gender=M&ageRange=26-35&profession=engineer&joinPeriod=2024&page=0&size=10
```

### Filter Parameters

| Parameter | Type | Valid Values | Description |
|-----------|------|--------------|-------------|
| `search` | String | Any text | Search across name, surname, email, phone, profession |
| `gender` | String | `M`, `F`, `O`, `all` | Filter by gender |
| `ageRange` | String | `18-25`, `26-35`, `36-45`, `46+`, `all` | Filter by age ranges |
| `profession` | String | Any text | Partial match on profession field |
| `joinPeriod` | String | `2024`, `2023`, `older`, `all` | Filter by registration period |
| `includeInactive` | Boolean | `true`, `false` | Include soft-deleted students |
| `page` | Integer | ≥ 0 | Page number (0-based) |
| `size` | Integer | > 0 | Page size |
| `sort` | String | `field,direction` | Sort specification |

### Error Responses

#### Invalid Gender
```bash
GET /students?gender=INVALID
```
```json
{
  "timestamp": "2024-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid gender value: INVALID. Valid values are: M, F, O",
  "path": "/students"
}
```

#### Invalid Age Range
```bash
GET /students?ageRange=30-40
```
```json
{
  "timestamp": "2024-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid age range: 30-40. Valid values are: 18-25, 26-35, 36-45, 46+",
  "path": "/students"
}
```

#### Invalid Join Period
```bash
GET /students?joinPeriod=2022
```
```json
{
  "timestamp": "2024-08-26T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid join period: 2022. Valid values are: 2024, 2023, older",
  "path": "/students"
}
```

## Implementation Details

### **Architecture**
- **JPA Specifications**: Dynamic query building using Criteria API
- **Repository Layer**: Extends `JpaSpecificationExecutor` for specification support
- **Service Layer**: Coordinates filtering logic and DTO conversion
- **Controller Layer**: Input validation and parameter processing

### **Filter Logic**

#### **Search Filter**
- Case-insensitive `LIKE` operations
- Searches across: name, surname, email, phone, profession
- Uses `COALESCE` to handle null profession values

#### **Gender Filter**
- Exact match on enum values
- Validates input and returns meaningful errors

#### **Age Range Filter**
- Calculates birth date ranges based on current date
- Maps age ranges to birth date boundaries:
  - `18-25`: Born between (today - 25 years - 1 day) and (today - 18 years)
  - `26-35`: Born between (today - 35 years - 1 day) and (today - 26 years)
  - `36-45`: Born between (today - 45 years - 1 day) and (today - 36 years)
  - `46+`: Born before or on (today - 46 years)

#### **Profession Filter**
- Case-insensitive partial matching
- Uses `COALESCE` to handle null values

#### **Join Period Filter**
- Date range filtering on `createdAt` field
- Maps periods to date ranges:
  - `2024`: Between 2024-01-01 00:00:00 UTC and 2025-01-01 00:00:00 UTC
  - `2023`: Between 2023-01-01 00:00:00 UTC and 2024-01-01 00:00:00 UTC
  - `older`: Before 2023-01-01 00:00:00 UTC

#### **Include Inactive Filter**
- When `false` (default): Only returns students where `deletedAt IS NULL`
- When `true`: Returns all students regardless of deletion status

### **Performance Considerations**
- Database-level filtering using JPA Criteria API
- Proper indexing recommended on frequently filtered fields
- Pagination prevents large result sets
- No in-memory filtering that would break pagination

### **Default Behavior**
- **Default Sort**: `createdAt DESC` (newest students first)
- **Default Page Size**: 20 items per page
- **Default Page**: 0 (first page)
- **Include Inactive**: `false` (active students only)

## Sample Response

```json
{
  "content": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@email.com",
      "name": "John",
      "surname": "Doe",
      "gender": "M",
      "birthDate": "1990-01-15",
      "phone": "11999999999",
      "profession": "Software Engineer",
      "street": "Main Street",
      "number": "123",
      "complement": "Apt 4B",
      "neighborhood": "Downtown",
      "cep": "01234567",
      "emergencyContactName": "Jane Doe",
      "emergencyContactPhone": "11888888888",
      "emergencyContactRelationship": "Spouse",
      "objectives": "Build muscle and improve fitness",
      "observations": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "deletedAt": null,
      "anamnesis": null,
      "physicalImpairments": []
    }
  ],
  "pageable": {
    "sort": {
      "empty": false,
      "sorted": true,
      "unsorted": false
    },
    "offset": 0,
    "pageSize": 20,
    "pageNumber": 0,
    "paged": true,
    "unpaged": false
  },
  "last": true,
  "totalPages": 1,
  "totalElements": 1,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": false,
    "sorted": true,
    "unsorted": false
  },
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

## Technical Implementation

### Files Created/Modified:

1. **`StudentSpecifications.java`** - New specification class for dynamic queries
2. **`StudentRepository.java`** - Extended with `JpaSpecificationExecutor`
3. **`StudentService.java`** - Updated to use specifications
4. **`StudentController.java`** - Added proper validation with meaningful error messages
5. **`StudentResponseDTO.java`** - Implemented `fromEntity()` method

The implementation is production-ready with comprehensive filtering, proper error handling, and database-level performance optimization.
