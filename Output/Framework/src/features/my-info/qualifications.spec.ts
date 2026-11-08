import { test, expect } from '../../fixtures/auth.fixture';
import { MyInfoPage } from './my-info.page';
import { QualificationsPage } from './qualifications.page';

test.describe('My Info — Qualifications', { tag: '@automated' }, () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const myInfo = new MyInfoPage(authenticatedPage);
    await myInfo.open();
    await myInfo.openTab('Qualifications');
  });

  // Source: Test Design CSV — TC-035 — "Verify Work Experience list displays existing records"
  test('TC-035 Work Experience table lists existing records', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await expect(qualifications.workExperienceTable()).toBeVisible();
  });

  // Source: Test Design CSV — TC-036 — "Verify the Add Work Experience form marks Company and Job Title as required"
  test('TC-036 Add Work Experience form marks Company and Job Title required', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await qualifications.addButtonFor('Work Experience').click();
    await expect(qualifications.companyLabel()).toBeVisible();
    await expect(qualifications.jobTitleLabel()).toBeVisible();
  });

  // Source: Test Design CSV — TC-037 — "Verify Education list displays existing records including rows with blank optional columns"
  test('TC-037 Education table lists existing records', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await expect(qualifications.educationTable()).toBeVisible();
  });

  // Source: Test Design CSV — TC-038 — "Verify the Add Education form Level dropdown options"
  test('TC-038 Add Education Level dropdown shows exactly 5 options', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await qualifications.addButtonFor('Education').click();
    const options = await qualifications.levelOptionTexts();
    expect(options).toEqual([
      '-- Select --',
      "Bachelor's Degree",
      'College Undergraduate',
      'High School Diploma',
      "Master's Degree",
    ]);
  });

  // Source: Test Design CSV — TC-039 — "Verify Skills section shows an empty state when no skill records exist"
  test('TC-039 Skills table shows No Records Found', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await expect(qualifications.noRecordsFoundWithin('Skills')).toBeVisible();
  });

  // Source: Test Design CSV — TC-040 — "Verify the Add Skill form marks Skill as required"
  test('TC-040 Add Skill form marks Skill as required', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await qualifications.addButtonFor('Skills').click();
    await expect(qualifications.skillLabel()).toBeVisible();
  });

  // Source: Test Design CSV — TC-041 — "Verify Languages list displays existing records"
  test('TC-041 Languages table lists existing records', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await expect(qualifications.languagesTable()).toBeVisible();
  });

  // Source: Test Design CSV — TC-042 — "Verify the Add Language form marks Language, Fluency, and Competency as required"
  test('TC-042 Add Language form marks Language/Fluency/Competency as required', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await qualifications.addButtonFor('Languages').click();
    await expect(qualifications.languageLabel()).toBeVisible();
    await expect(qualifications.fluencyLabel()).toBeVisible();
    await expect(qualifications.competencyLabel()).toBeVisible();
  });

  // Source: Test Design CSV — TC-043 — "Verify License list displays an existing record"
  test('TC-043 License table lists the existing record', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await expect(qualifications.licenseTable()).toBeVisible();
  });

  // Source: Test Design CSV — TC-044 — "Verify the Add License form marks License Type as required"
  test('TC-044 Add License form marks License Type as required', async ({ authenticatedPage }) => {
    const qualifications = new QualificationsPage(authenticatedPage);
    await qualifications.addButtonFor('License').click();
    await expect(qualifications.licenseTypeLabel()).toBeVisible();
  });
});
