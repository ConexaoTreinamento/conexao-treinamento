# Student API Documentation

## Get Students Endpoint

The `GET /students` endpoint now supports comprehensive filtering and pagination.

### Base URL
```
GET /students
```

### Query Parameters

| Parameter | Type | Description | Default | Example Values |
|-----------|------|-------------|---------|----------------|
| `search` | String | Search students by name, surname, email, phone, or profession | - | `"john"`, `"engineer"` |
| `gender` | String | Filter by gender | - | `"M"`, `"F"`, `"O"` |
| `profession` | String | Filter by profession (partial match) | - | `"engineer"`, `"teacher"` |
| `ageRange` | String | Filter by age ranges | - | `"18-25"`, `"26-35"`, `"36-45"`, `"46+"` |
| `joinPeriod` | String | Filter by registration period | - | `"2024"`, `"2023"`, `"older"` |
| `includeInactive` | Boolean | Include inactive/deleted students | `false` | `true`, `false` |
| `page` | Integer | Page number (0-based) | `0` | `0`, `1`, `2` |
| `size` | Integer | Page size | `20` | `10`, `20`, `50` |
| `sort` | String | Sort field and direction | `createdAt,desc` | `name,asc`, `email,desc` |

### Example Requests

#### 1. Basic pagination
```
GET /students?page=0&size=10
```

#### 2. Search students
```
GET /students?search=john&page=0&size=20
```

#### 3. Filter by gender
```
GET /students?gender=M&page=0&size=20
```

#### 4. Filter by age range
```
GET /students?ageRange=26-35&page=0&size=20
```

#### 5. Filter by profession
```
GET /students?profession=engineer&page=0&size=20
```

#### 6. Filter by join period
```
GET /students?joinPeriod=2024&page=0&size=20
```

#### 7. Combined filters
```
GET /students?search=john&gender=M&ageRange=26-35&profession=engineer&joinPeriod=2024&page=0&size=20
```

#### 8. Include inactive students
```
GET /students?includeInactive=true&page=0&size=20
```

### Response Format

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

### Filter Logic

1. **Search**: Performs case-insensitive partial matching on:
   - Name
   - Surname  
   - Email
   - Phone
   - Profession

2. **Gender**: Exact match on gender enum values (M, F, O)

3. **Profession**: Case-insensitive partial matching

4. **Age Range**: Calculated based on current date vs birth date
   - `"18-25"`: Ages 18 to 25 inclusive
   - `"26-35"`: Ages 26 to 35 inclusive  
   - `"36-45"`: Ages 36 to 45 inclusive
   - `"46+"`: Ages 46 and above

5. **Join Period**: Based on registration date (createdAt)
   - `"2024"`: Registered in 2024
   - `"2023"`: Registered in 2023
   - `"older"`: Registered before 2023

6. **Include Inactive**: When `false` (default), only returns active students (deletedAt is null)

### Default Sorting

By default, students are sorted by `createdAt` in descending order (newest first).

### Implementation Notes

- All filters are optional and can be combined
- Empty or null values are ignored
- Case-insensitive search for text fields
- Uses Spring Data JPA pagination
- Supports standard Spring Data sorting syntax
