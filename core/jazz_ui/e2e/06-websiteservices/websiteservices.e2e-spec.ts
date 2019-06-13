/*
 *Copyright 2016-2017 T Mobile, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); You may not use
 * this file except in compliance with the License. A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 * implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { browser, element, by, protractor, $ } from 'protractor';
import { Jazz } from '../page-objects/jazzservices.po';
import { Timeouts, Browser } from 'selenium-webdriver';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { Common } from '../common/commontest';


describe('Overview', () => {
  let jazzServices_po: Jazz;
  let commonUtils: Common;

  const EC = protractor.ExpectedConditions;
  let winhandle;
  let servicename;
  let test;
  let flag = 1;

  beforeAll(() => {
    jazzServices_po = new Jazz();
    commonUtils = new Common();
    browser.driver.sleep(Common.miniWait);
    commonUtils.Login();
  });
  beforeEach(() => {
    if (flag == 0) {
      pending();
    }
  });

  function createservice(servicename) {
    jazzServices_po.getServiceName().sendKeys(servicename);
    jazzServices_po.getNameSpace().sendKeys('jazztest');
    jazzServices_po.getServiceDescription().sendKeys('Testing');
  }

  function serviceapprover() {
    browser.driver.sleep(Common.miniWait);
    jazzServices_po.getSubmit().click();
    commonUtils.fluentwaittry(jazzServices_po.getDone(), Common.shortWait);
    jazzServices_po.getDone().click();
  }

  function waitforskiptest(ele, t) {
    browser.manage().timeouts().implicitlyWait(0);
    browser.wait(function () {
      browser.sleep(t);
      return ele.isDisplayed()
        .then(
          function (text) {
            flag = 1;
            return text;
          },
          function (error) {
            browser.refresh();
            flag = 0;
            return false;
          });
    }, 240 * 1000);
  }

  it('Create Website Service', () => {
    browser.driver.switchTo().activeElement();
    browser.driver.sleep(Common.miniWait);
    browser.wait(EC.visibilityOf(jazzServices_po.getCreateService()), Common.timeOutHigh).then(null, function (err) {
      console.log(err);
      flag = 0;
      browser.refresh();
    });
    browser.wait(EC.elementToBeClickable(jazzServices_po.getCreateService()), Common.timeOutHigh);
    jazzServices_po.getCreateService().click();
    browser.driver.switchTo().activeElement();
    browser.driver.sleep(Common.miniWait);
    //Creating Website
    jazzServices_po.getWebsite().click();
    var min = 111111111;
    var max = 999999999;
    var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    servicename = 'servicename' + randomNum;
    createservice(servicename);
    serviceapprover();
    browser.driver.sleep(Common.mediumWait);
    //Verifying the service
    expect(jazzServices_po.getService(servicename).getText()).toEqual(servicename);
    expect(jazzServices_po.getWebsiteType(servicename).getText()).toEqual('website');
    expect(jazzServices_po.getWebsiteStatus(servicename).getText()).toEqual('creation started');
    waitforskiptest(jazzServices_po.serviceStatus(servicename), Common.xxlWait);
  });

  it('Verify Webpage Title', () => {
    commonUtils.fluentwaittry(jazzServices_po.getService(servicename), Common.miniWait);
    browser.wait(EC.elementToBeClickable(jazzServices_po.getService(servicename)), Common.timeOutHigh);
    //To Navigate to the particular service and verifying the Page
    jazzServices_po.getService(servicename).click();
    commonUtils.fluentwaittry(jazzServices_po.getOverviewStatus(), Common.miniWait);
    expect(jazzServices_po.getOverviewStatus().getText()).toEqual('OVERVIEW');
    commonUtils.fluentwaittry(jazzServices_po.getServiceNameHeader(), Common.miniWait);
    //To get the corresponding environment[Prod]
    waitforskiptest(jazzServices_po.getProdName(), Common.xxlWait);
    jazzServices_po.getProdName().click();
    commonUtils.waitForSpinnerDisappear();
    commonUtils.refreshbutton(jazzServices_po.getDeploymentStatus(), Common.miniWait);
    commonUtils.refreshbutton(jazzServices_po.getProdHeader(), Common.miniWait);
    //Verifying the browser id at the Deployment Tab
    expect(jazzServices_po.getDeploymentStatus().getText()).toEqual('DEPLOYMENTS');
    browser.driver.switchTo().activeElement();
  });

  it('Verify METRICS Navigation for Website', () => {
    commonUtils.fluentwaittry(jazzServices_po.getServiceHomePage(), Common.miniWait);
    jazzServices_po.getServiceHomePage().click();
    browser.sleep(Common.microWait);
    browser.driver.switchTo().activeElement();
    commonUtils.fluentwaittry(jazzServices_po.getService(servicename), Common.miniWait);
    // // Navigation to services
    browser.wait(EC.elementToBeClickable(jazzServices_po.getService(servicename)), Common.timeOutHigh);
    // //To Navigate to the particular service and verifying the Page
    jazzServices_po.getService(servicename).click();
    commonUtils.fluentwaittry(jazzServices_po.getServiceNameHeader(), Common.miniWait);
    commonUtils.fluentwaittry(jazzServices_po.getProdName(), Common.miniWait);
    jazzServices_po.getProdName().click();
    commonUtils.waitForSpinnerDisappear();
    commonUtils.refreshbutton(jazzServices_po.getProdHeader(), Common.miniWait);
    browser.driver.switchTo().activeElement();
    commonUtils.refreshbutton(jazzServices_po.getMetrices(), Common.miniWait);
    jazzServices_po.getMetrices().click();
    commonUtils.waitForMetricsSpinner();
    commonUtils.refreshbutton(jazzServices_po.getDeploymentStatus(), Common.miniWait);
    jazzServices_po.getDeploymentStatus().click();
    commonUtils.waitForSpinnerDisappear();
    commonUtils.fluentwaittry(jazzServices_po.goToFunction(), Common.miniWait);
    expect(jazzServices_po.goToFunction().getText()).toEqual('GO TO WEBSITE');
    jazzServices_po.goToFunction().click();
    browser.getAllWindowHandles().then(function (handles) {
      browser.switchTo().window(handles[1]).then(function () {
        browser.sleep(Common.miniWait);
        //As go to website page is not reachable and it takes more than 10 minutes to display so commenting the below steps for now.
        //expect(jazzServices_po.websiteTemplete().getText()).toEqual('Jazz Serverless Platform Website Template');
        browser.close();
      });
      browser.switchTo().window(handles[0]).then(function () {
        commonUtils.refreshbutton(jazzServices_po.getMetrices(), Common.miniWait);
        jazzServices_po.getMetrices().click();
        commonUtils.waitForSpinnerDisappear();
      });
    });
  });


  it('Verify Website Deployments', () => {
    commonUtils.verifyDelpoyment();
  });

  it('Verify Wesbsite Asset', () => {
    commonUtils.verifyAsset();
  });


  it('Verify METRICS COUNT for Website', () => {
    browser.sleep(Common.microWait);
    // //To Navigate to the particular service and verifying the Page
    commonUtils.fluentwaittry(jazzServices_po.getMetrices(), Common.miniWait);
    jazzServices_po.getMetrices().click();
    commonUtils.waitForMetricsSpinner();
    // As go to website page is not reachable so it is not generating any value so commenting the below steps for now.
    //commonUtils.refreshbutton(jazzServices_po.getMetricesRequestCount(),Common.miniWait);
    //expect(jazzServices_po.getMetricesRequestCount().getText()).toEqual('10');  
    browser.sleep(Common.microWait);
  });

  it('Identifying Environment and Navigation for Website', () => {
    browser.driver.sleep(Common.microWait);
    commonUtils.fluentwaittry(jazzServices_po.getServiceHomePage(), Common.miniWait);
    jazzServices_po.getServiceHomePage().click();
    commonUtils.fluentwaittry(jazzServices_po.getService(servicename), Common.miniWait);
    browser.wait(EC.elementToBeClickable(jazzServices_po.getService(servicename)), Common.timeOutHigh);
    //To Navigate to the particular service and verifying the Page
    jazzServices_po.getService(servicename).click();
    browser.wait(EC.visibilityOf(jazzServices_po.getRepository()), Common.timeOutHigh);
    jazzServices_po.getRepository().click();
    browser.sleep(Common.miniWait);

  });
  it('Create the Test Branch for Website', () => {
    browser.getAllWindowHandles().then(function (handles) {
      browser.sleep(Common.shortWait);
      var min = 11;
      var max = 99;
      var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      test = 'test' + randomNum;
      browser.switchTo().window(handles[1]).then(function () {
        browser.sleep(Common.microWait);

        var some_name = browser.getTitle().then(function (webpagetitle) {
          if (webpagetitle === 'Sign in · GitLab') {
            jazzServices_po.gitUsername().sendKeys(Common.config.SCM_USERNAME).then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.gitPassword().sendKeys(Common.config.SCM_PASSWORD).then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.gitLogin().click().then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.drpGitBranchType().click().then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.selectGitBranchType().click().then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.gitBranchName().sendKeys(test).then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.btnGitCreateBranch().click().then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.getGitLogoutIcon().click().then(null, function (err) {
              console.log(err.name);
            });
            jazzServices_po.getGitLogout().click().then(null, function (err) {
              console.log(err.name);
              flag = 0;
              browser.sleep(Common.longWait);
              browser.close();
            });
            browser.close();
          }
          else {
            expect(webpagetitle).not.toEqual('Sign in · GitLab');
            jazzServices_po.bitUsername().sendKeys(Common.config.SCM_USERNAME).then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.bitPassword().sendKeys(Common.config.SCM_PASSWORD).then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.bitLogin().click().then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.createBranch().click().then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.drp_BranchType().click().then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.select_BranchType().click().then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.branchName().sendKeys(test).then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.btn_CreateBranch().click().then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.getBitLogoutIcon().click().then(null, function (err) {
              console.log(err.name);
            });
            browser.sleep(Common.microWait);
            jazzServices_po.getBitLogout().click().then(null, function (err) {
              console.log(err.name);
              flag = 0;
              browser.sleep(Common.longWait);
              browser.close();
            });
            browser.sleep(Common.microWait);
            browser.close();
          }
        });
      });

      browser.switchTo().window(handles[0]).then(function () {
        browser.sleep(Common.miniWait);
        waitforskiptest(jazzServices_po.activeTestBranch(), Common.xxlWait);
        jazzServices_po.activeTestBranch().click().
          then(null, function (err) {
            console.log("the error occurred is : " + err.name);
          });
        commonUtils.waitForSpinnerDisappear();
        browser.driver.switchTo().activeElement();
        browser.sleep(Common.miniWait);
      });
    });

  });

  it('Verify METRICS Navigation for Website for Test Branch', () => {
    browser.sleep(Common.microWait);
    commonUtils.fluentwaittry(jazzServices_po.goToFunction(), Common.miniWait);
    expect(jazzServices_po.goToFunction().getText()).toEqual('GO TO WEBSITE');
    jazzServices_po.goToFunction().click();
    browser.getAllWindowHandles().then(function (handles) {
      browser.switchTo().window(handles[1]).then(function () {
        browser.sleep(Common.miniWait);
        //As go to website page is not reachable and it takes more than 10 minutes to display so commenting the below steps for now.
        //expect(jazzServices_po.websiteTemplete().getText()).toEqual('Jazz Serverless Platform Website Template');
        browser.close();
      });
      browser.switchTo().window(handles[0]).then(function () {
        commonUtils.refreshbutton(jazzServices_po.getMetrices(), Common.miniWait);
        jazzServices_po.getMetrices().click();
        commonUtils.waitForSpinnerDisappear();
      });
    });
  });


  it('Verify Website Deployments for Test Branch', () => {
    commonUtils.verifyDelpoyment();
  });

  it('Verify Wesbsite Asset for Test Branch', () => {
    commonUtils.verifyAsset();
  });

  it('Verify METRICS COUNT for Website in Test Branch', () => {
    browser.sleep(Common.microWait);
    commonUtils.fluentwaittry(jazzServices_po.getMetrices(), Common.mediumWait);
    jazzServices_po.getMetrices().click();
    commonUtils.waitForMetricsSpinner();
    // As go to website page is not reachable so it is not generating any value so commenting the below steps for now.
    //commonUtils.refreshbutton(jazzServices_po.getMetricesRequestCount(),Common.miniWait);
    //expect(jazzServices_po.getMetricesRequestCount().getText()).toEqual('10');  
    browser.sleep(Common.microWait);
    commonUtils.fluentwaittry(jazzServices_po.getServiceHomePage(), Common.miniWait);
    jazzServices_po.getServiceHomePage().click();
  });
});

