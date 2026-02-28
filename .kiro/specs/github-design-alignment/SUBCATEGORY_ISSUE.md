# Sub-Category Field Issue

## Issue Description

The Sub-Category field is not being enabled when a Category is selected in the transaction form.

## Expected Behavior

1. User selects a Transaction Type
2. Category dropdown becomes enabled and shows filtered categories
3. User selects a Category
4. Sub-Category dropdown becomes enabled and shows filtered sub-categories for that category

## Current Behavior

The Sub-Category field remains disabled even after selecting a Category.

## Investigation Needed

The code in `TransactionForm.new.tsx` appears correct:

```typescript
// Filter sub-categories when category changes
useEffect(() => {
  if (selectedCategoryId > 0) {
    const filtered = subCategories.filter(
      (subCat) => subCat.categoryId === selectedCategoryId
    );
    setFilteredSubCategories(filtered);

    const currentSubCategoryId = watch('subCategoryId');
    if (currentSubCategoryId > 0 && !filtered.find((sc) => sc.id === currentSubCategoryId)) {
      setValue('subCategoryId', 0);
    }
  } else {
    setFilteredSubCategories([]);
    setValue('subCategoryId', 0);
  }
}, [selectedCategoryId, subCategories, setValue, watch]);
```

And the disabled logic:
```typescript
disabled={!selectedCategoryId || filteredSubCategories.length === 0}
```

## Possible Causes

1. **No Sub-Categories in Database**: If there are no sub-categories associated with the selected category, the field will remain disabled
2. **Data Not Loaded**: The `subCategories` array from ConfigContext might be empty
3. **Category ID Mismatch**: The `categoryId` in sub-categories might not match the selected category

## Debugging Steps

1. Check browser console for any errors
2. Verify data in ConfigContext:
   - Open React DevTools
   - Check ConfigContext values
   - Verify `subCategories` array has data
   - Verify `categoryId` relationships are correct

3. Check database:
   - Verify sub-categories exist in the database
   - Verify they have correct `categoryId` foreign keys

4. Add console logging:
   ```typescript
   useEffect(() => {
     console.log('Selected Category ID:', selectedCategoryId);
     console.log('All Sub-Categories:', subCategories);
     if (selectedCategoryId > 0) {
       const filtered = subCategories.filter(
         (subCat) => subCat.categoryId === selectedCategoryId
       );
       console.log('Filtered Sub-Categories:', filtered);
       setFilteredSubCategories(filtered);
     }
   }, [selectedCategoryId, subCategories]);
   ```

## Recommended Solution

1. First, verify the database has sub-categories with correct relationships
2. Check the Admin Panel to ensure categories and sub-categories are properly configured
3. If data exists, add debugging to identify where the filtering is failing
4. Consider adding a helpful message when no sub-categories are available:
   ```typescript
   {filteredSubCategories.length === 0 && selectedCategoryId > 0 && (
     <p className="text-sm text-muted-foreground">
       No sub-categories available for this category. 
       <Link to="/admin" className="text-primary hover:underline ml-1">
         Add sub-categories in Admin Panel
       </Link>
     </p>
   )}
   ```

## Status

⚠️ NEEDS INVESTIGATION

This is a separate issue from the performance optimization task (Task 12) which has been completed successfully.

## Next Steps

1. Verify database has sub-category data
2. Check Admin Panel configuration
3. Add debugging if needed
4. Create a separate task/issue for fixing this if it's a bug
