### rest1 组织树

settlementCurrency 用的是code

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v2/form-entity-data/basic-system-setting/self-organization-info-form/list>

#### payload

```json
{
  "selectColId": [
    "name",
    "organizationType",
    "organizationId",
    "janJanuary",
    "febFebruary",
    "marMarch",
    "aprApril",
    "mayMay",
    "junJune",
    "julJuly",
    "augAugust",
    "sepSeptember",
    "octOctober",
    "novNovember",
    "decDecember",
    "leadToQualification",
    "qualificationToDiscovery",
    "discoveryToProposal",
    "proposalToNegotiation",
    "negotiationToWin",
    "negotiationToLoss",
    "theStartDateOfTheFiscalYear",
    "theEndDateOfTheFiscalYear",
    "settlementCurrency"
  ]
}
```

#### response

```json
{
  "count": 11,
  "results": [
    {
      "decemberPercentage": 8.33,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "qFourPercentage": 25,
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21732",
              "label": "总经理办公室",
              "i18nLabel": {}
            }
          ],
          "label": "李家强",
          "id": 360,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "360",
          "email": "jack.li@forlandholding.com"
        }
      ],
      "parentOrganization": [
        {
          "value": "23413",
          "label": "王晗丞",
          "i18nLabel": {}
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "organizationId": "23413",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "id": 293,
          "value": "293",
          "email": "hc.wang@forlandholding.com"
        }
      ],
      "createdTime": "2026-07-14T03:11:56.675+00:00",
      "parallelStreamIndex": 0,
      "junePercentage": 8.33,
      "februaryPercentage": 8.33,
      "id": 32856,
      "januaryPercentage": 8.33,
      "day": "365",
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "novemberPercentage": 8.33,
      "updateUserId": 10249,
      "qOnePercentage": 25,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "objectVersion": 1,
      "groupName": [],
      "julyPercentage": 8.33,
      "settlementCurrency": [],
      "deleted": false,
      "marchPercentage": 8.33,
      "formEntityToken": "self-organization-info-form",
      "inputMethod": [],
      "name": "李家强",
      "aprilPercentage": 8.33,
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null
    },
    {
      "decemberPercentage": 8.33,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "name_i18n_zh-CN": "财务部",
      "qFourPercentage": 25,
      "memberName": [],
      "parentOrganization": [
        {
          "value": "23413",
          "label": "王晗丞",
          "i18nLabel": {}
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "organizationId": "23413",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [],
      "createdTime": "2026-06-17T02:25:50.999+00:00",
      "parallelStreamIndex": 1,
      "junePercentage": 8.33,
      "februaryPercentage": 8.33,
      "id": 23425,
      "januaryPercentage": 8.33,
      "day": "365",
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "novemberPercentage": 8.33,
      "updateUserId": 10249,
      "qOnePercentage": 25,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "team",
          "label_i18n_zh-CN": "\uD83D\uDC65 团队",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC65 Team",
          "label_i18n_ja-JP": "\uD83D\uDC65 チーム",
          "label": "\uD83D\uDC65 团队",
          "id": 21051,
          "value": "21051"
        }
      ],
      "objectVersion": 3,
      "groupName": [],
      "julyPercentage": 8.33,
      "settlementCurrency": [],
      "deleted": false,
      "marchPercentage": 8.33,
      "formEntityToken": "self-organization-info-form",
      "inputMethod": [],
      "name": "财务部",
      "aprilPercentage": 8.33,
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null
    },
    {
      "qOne": 2500000,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "qFourPercentage": 25,
      "qThree": 2500000,
      "annualMetrics": 10000000,
      "marMarch": 833333.3333333334,
      "parentOrganization": [
        {
          "value": "23414",
          "label": "市场部",
          "i18nLabel": {}
        }
      ],
      "sepSeptember": 833333.3333333334,
      "organizationId": "23414",
      "threadId": null,
      "novNovember": 833333.3333333334,
      "augAugust": 833333.3333333334,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "id": 293,
          "value": "293",
          "email": "hc.wang@forlandholding.com"
        }
      ],
      "createdTime": "2026-06-17T01:49:31.608+00:00",
      "parallelStreamIndex": 2,
      "februaryPercentage": 8.33,
      "id": 23418,
      "day": "365",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "janJanuary": 833333.3333333334,
      "updateUserId": 10249,
      "julJuly": 833333.3333333334,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "febFebruary": 833333.3333333334,
      "qTwo": 2500000,
      "objectVersion": 4,
      "groupName": [],
      "settlementCurrency": [],
      "formEntityToken": "self-organization-info-form",
      "name": "胡剑飞",
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null,
      "decemberPercentage": 8.33,
      "totalMonthlyAbsoluteValue": 10000000,
      "name_i18n_zh-CN": "胡剑飞",
      "junJune": 833333.3333333334,
      "octOctober": 833333.3333333334,
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "胡剑飞",
          "id": 297,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "297",
          "email": "jeff.hu@forlandholding.com"
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "mayMay": 833333.3333333334,
      "total": 10000000,
      "decDecember": 833333.3333333334,
      "junePercentage": 8.33,
      "januaryPercentage": 8.33,
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "novemberPercentage": 8.33,
      "qOnePercentage": 25,
      "userId": 10248,
      "qFour": 2500000,
      "allocationMode": [
        {
          "label": "按季度",
          "value": "byQuarter"
        }
      ],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "julyPercentage": 8.33,
      "deleted": false,
      "marchPercentage": 8.33,
      "inputMethod": [
        {
          "label": "百分比%",
          "value": "percentage"
        }
      ],
      "aprilPercentage": 8.33,
      "aprApril": 833333.3333333334
    },
    {
      "decemberPercentage": 8.33,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "name_i18n_zh-CN": "汤宝茹",
      "qFourPercentage": 25,
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "汤宝茹",
          "id": 296,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "296",
          "email": "polina.tang@forlandholding.com"
        }
      ],
      "parentOrganization": [
        {
          "value": "23414",
          "label": "市场部",
          "i18nLabel": {}
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "organizationId": "23414",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "id": 293,
          "value": "293",
          "email": "hc.wang@forlandholding.com"
        }
      ],
      "createdTime": "2026-06-17T01:48:43.461+00:00",
      "parallelStreamIndex": 3,
      "junePercentage": 8.33,
      "februaryPercentage": 8.33,
      "id": 23417,
      "januaryPercentage": 8.33,
      "day": "365",
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "novemberPercentage": 8.33,
      "updateUserId": 10249,
      "qOnePercentage": 25,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "objectVersion": 3,
      "groupName": [],
      "julyPercentage": 8.33,
      "settlementCurrency": [],
      "deleted": false,
      "marchPercentage": 8.33,
      "formEntityToken": "self-organization-info-form",
      "inputMethod": [],
      "name": "汤宝茹",
      "aprilPercentage": 8.33,
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null
    },
    {
      "decemberPercentage": 8.33,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "name_i18n_zh-CN": "徐力群",
      "qFourPercentage": 25,
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "徐力群",
          "id": 294,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "294",
          "email": "liqun.xu@forlandholding.com"
        }
      ],
      "parentOrganization": [
        {
          "value": "23425",
          "label": "财务部",
          "i18nLabel": {}
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "organizationId": "23425",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "id": 293,
          "value": "293",
          "email": "hc.wang@forlandholding.com"
        }
      ],
      "createdTime": "2026-06-17T01:48:29.638+00:00",
      "parallelStreamIndex": 4,
      "junePercentage": 8.33,
      "februaryPercentage": 8.33,
      "id": 23416,
      "januaryPercentage": 8.33,
      "day": "365",
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "novemberPercentage": 8.33,
      "updateUserId": 10249,
      "qOnePercentage": 25,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "objectVersion": 3,
      "groupName": [],
      "julyPercentage": 8.33,
      "settlementCurrency": [],
      "deleted": false,
      "marchPercentage": 8.33,
      "formEntityToken": "self-organization-info-form",
      "inputMethod": [],
      "name": "徐力群",
      "aprilPercentage": 8.33,
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null
    },
    {
      "decemberPercentage": 8.33,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "name_i18n_zh-CN": "薛培锋",
      "qFourPercentage": 25,
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "薛培锋",
          "id": 295,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "295",
          "email": "xpf@forlandholding.com"
        }
      ],
      "parentOrganization": [
        {
          "value": "23414",
          "label": "市场部",
          "i18nLabel": {}
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "organizationId": "23414",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "id": 293,
          "value": "293",
          "email": "hc.wang@forlandholding.com"
        }
      ],
      "createdTime": "2026-06-17T01:47:55.884+00:00",
      "parallelStreamIndex": 5,
      "junePercentage": 8.33,
      "februaryPercentage": 8.33,
      "id": 23415,
      "januaryPercentage": 8.33,
      "day": "365",
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "novemberPercentage": 8.33,
      "updateUserId": 10249,
      "qOnePercentage": 25,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "objectVersion": 3,
      "groupName": [],
      "julyPercentage": 8.33,
      "settlementCurrency": [],
      "deleted": false,
      "marchPercentage": 8.33,
      "formEntityToken": "self-organization-info-form",
      "inputMethod": [],
      "name": "薛培锋",
      "aprilPercentage": 8.33,
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null
    },
    {
      "decemberPercentage": 8.33,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "name_i18n_zh-CN": "市场部",
      "qFourPercentage": 25,
      "memberName": [],
      "parentOrganization": [
        {
          "value": "32856",
          "label": "李家强",
          "i18nLabel": {}
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "organizationId": "32856",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [],
      "createdTime": "2026-06-17T01:47:32.874+00:00",
      "parallelStreamIndex": 6,
      "junePercentage": 8.33,
      "februaryPercentage": 8.33,
      "id": 23414,
      "januaryPercentage": 8.33,
      "day": "365",
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "novemberPercentage": 8.33,
      "updateUserId": 10249,
      "qOnePercentage": 25,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "team",
          "label_i18n_zh-CN": "\uD83D\uDC65 团队",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC65 Team",
          "label_i18n_ja-JP": "\uD83D\uDC65 チーム",
          "label": "\uD83D\uDC65 团队",
          "id": 21051,
          "value": "21051"
        }
      ],
      "objectVersion": 4,
      "groupName": [],
      "julyPercentage": 8.33,
      "settlementCurrency": [],
      "deleted": false,
      "marchPercentage": 8.33,
      "formEntityToken": "self-organization-info-form",
      "inputMethod": [],
      "name": "市场部",
      "aprilPercentage": 8.33,
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null
    },
    {
      "qOne": 10000000,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "qFourPercentage": 25,
      "qThree": 10000000,
      "annualMetrics": 40000000,
      "marMarch": 3333333.3333333335,
      "parentOrganization": [
        {
          "value": "23412",
          "label": "总经理办公室",
          "i18nLabel": {}
        }
      ],
      "sepSeptember": 3333333.3333333335,
      "organizationId": "23412",
      "threadId": null,
      "novNovember": 3333333.3333333335,
      "augAugust": 3333333.3333333335,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [],
      "createdTime": "2026-06-17T01:47:13.130+00:00",
      "parallelStreamIndex": 7,
      "februaryPercentage": 8.33,
      "id": 23413,
      "day": "365",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "janJanuary": 3333333.3333333335,
      "updateUserId": 10249,
      "julJuly": 3333333.3333333335,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "febFebruary": 3333333.3333333335,
      "qTwo": 10000000,
      "objectVersion": 6,
      "groupName": [],
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 21174,
          "value": "CNY"
        }
      ],
      "formEntityToken": "self-organization-info-form",
      "name": "王晗丞",
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null,
      "decemberPercentage": 8.33,
      "totalMonthlyAbsoluteValue": 40000000,
      "name_i18n_zh-CN": "王晗丞",
      "junJune": 3333333.3333333335,
      "octOctober": 3333333.3333333335,
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [],
          "organization": [
            {
              "value": "21732",
              "label": "总经理办公室",
              "i18nLabel": {}
            }
          ],
          "label": "王晗丞",
          "id": 293,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "293",
          "email": "hc.wang@forlandholding.com"
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "mayMay": 3333333.3333333335,
      "total": 40000000,
      "decDecember": 3333333.3333333335,
      "junePercentage": 8.33,
      "januaryPercentage": 8.33,
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "novemberPercentage": 8.33,
      "qOnePercentage": 25,
      "userId": 10248,
      "qFour": 10000000,
      "allocationMode": [
        {
          "label": "按月度",
          "value": "byMonthly"
        }
      ],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "julyPercentage": 8.33,
      "deleted": false,
      "marchPercentage": 8.33,
      "inputMethod": [
        {
          "label": "绝对值",
          "value": "absoluteValue"
        }
      ],
      "aprilPercentage": 8.33,
      "aprApril": 3333333.3333333335
    },
    {
      "qOne": 20000000,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "qFourPercentage": 25,
      "qThree": 20000000,
      "annualMetrics": 80000000,
      "marMarch": 6666666.666666667,
      "parentOrganization": [
        {
          "value": "23409",
          "label": "福兰德科技",
          "i18nLabel": {}
        }
      ],
      "sepSeptember": 6666666.666666667,
      "organizationId": "23409",
      "threadId": null,
      "novNovember": 6666666.666666667,
      "augAugust": 6666666.666666667,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [],
      "createdTime": "2026-06-17T01:46:48.771+00:00",
      "parallelStreamIndex": 8,
      "februaryPercentage": 8.33,
      "id": 23412,
      "day": "365",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "janJanuary": 6666666.666666667,
      "updateUserId": 10249,
      "julJuly": 6666666.666666667,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "febFebruary": 6666666.666666667,
      "qTwo": 20000000,
      "objectVersion": 8,
      "groupName": [],
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 21174,
          "value": "CNY"
        }
      ],
      "formEntityToken": "self-organization-info-form",
      "name": "总经理办公室",
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null,
      "decemberPercentage": 8.33,
      "totalMonthlyAbsoluteValue": 80000000,
      "name_i18n_zh-CN": "总经理办公室",
      "junJune": 6666666.666666667,
      "octOctober": 6666666.666666667,
      "memberName": [],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "mayMay": 6666666.666666667,
      "total": 80000000,
      "decDecember": 6666666.666666667,
      "junePercentage": 8.33,
      "januaryPercentage": 8.33,
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "novemberPercentage": 8.33,
      "qOnePercentage": 25,
      "userId": 10248,
      "qFour": 20000000,
      "allocationMode": [
        {
          "label": "按月度",
          "value": "byMonthly"
        }
      ],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "team",
          "label_i18n_zh-CN": "\uD83D\uDC65 团队",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC65 Team",
          "label_i18n_ja-JP": "\uD83D\uDC65 チーム",
          "label": "\uD83D\uDC65 团队",
          "id": 21051,
          "value": "21051"
        }
      ],
      "julyPercentage": 8.33,
      "deleted": false,
      "marchPercentage": 8.33,
      "inputMethod": [
        {
          "label": "绝对值",
          "value": "absoluteValue"
        }
      ],
      "aprilPercentage": 8.33,
      "aprApril": 6666666.666666667
    },
    {
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "qFourPercentage": 25,
      "parentOrganization": [
        {
          "value": "23412",
          "label": "总经理办公室",
          "i18nLabel": {}
        }
      ],
      "organizationId": "23412",
      "threadId": null,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [],
      "createdTime": "2026-06-17T01:40:16.877+00:00",
      "parallelStreamIndex": 9,
      "februaryPercentage": 8.33,
      "id": 23410,
      "day": "365",
      "laborCategory": "",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "updateUserId": 10249,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "objectVersion": 3,
      "groupName": [],
      "settlementCurrency": [],
      "formEntityToken": "self-organization-info-form",
      "name": "王文毅",
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null,
      "decemberPercentage": 8.33,
      "name_i18n_zh-CN": "王文毅",
      "memberName": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "directReportManager": [],
          "organization": [
            {
              "value": "21732",
              "label": "总经理办公室",
              "i18nLabel": {}
            }
          ],
          "label": "王文毅",
          "id": 292,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "292",
          "email": "wwy@forlandholding.com"
        }
      ],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "junePercentage": 8.33,
      "januaryPercentage": 8.33,
      "totalPercentage": 100,
      "laborContract": "",
      "formEntityName": "Self Organization Info Form",
      "novemberPercentage": 8.33,
      "qOnePercentage": 25,
      "userId": 10248,
      "allocationMode": [],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "sales",
          "label_i18n_zh-CN": "\uD83D\uDC64 销售",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83D\uDC64 Sales",
          "label_i18n_ja-JP": "\uD83D\uDC64 営業",
          "label": "\uD83D\uDC64 销售",
          "id": 21050,
          "value": "21050"
        }
      ],
      "julyPercentage": 8.33,
      "deleted": false,
      "marchPercentage": 8.33,
      "inputMethod": [],
      "aprilPercentage": 8.33
    },
    {
      "qOne": 20000000,
      "augustPercentage": 8.33,
      "octoberPercentage": 8.33,
      "qFourPercentage": 25,
      "qThree": 20000000,
      "annualMetrics": 80000000,
      "marMarch": 6666666.666666667,
      "parentOrganization": [],
      "sepSeptember": 6666666.666666667,
      "threadId": null,
      "novNovember": 6666666.666666667,
      "augAugust": 6666666.666666667,
      "qTwoPercentage": 25,
      "formEntityId": 1521,
      "directReportManager": [],
      "createdTime": "2026-06-17T01:37:32.276+00:00",
      "parallelStreamIndex": 10,
      "februaryPercentage": 8.33,
      "id": 23409,
      "day": "365",
      "updatedTime": "2026-07-14T07:43:44.286+00:00",
      "pbcToken": "basic-system-setting",
      "qThreePercentage": 25,
      "janJanuary": 6666666.666666667,
      "updateUserId": 10249,
      "julJuly": 6666666.666666667,
      "totalPercentageQfour": 100,
      "theEndDateOfTheFiscalYear": "2026-12-31",
      "febFebruary": 6666666.666666667,
      "qTwo": 20000000,
      "objectVersion": 3,
      "groupName": [],
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "formEntityToken": "self-organization-info-form",
      "name": "福兰德科技",
      "septemberPercentage": 8.33,
      "theStartDateOfTheFiscalYear": "2026-01-01",
      "nodeId": null,
      "decemberPercentage": 8.33,
      "totalMonthlyAbsoluteValue": 80000000,
      "name_i18n_zh-CN": "福兰德科技",
      "junJune": 6666666.666666667,
      "octOctober": 6666666.666666667,
      "memberName": [],
      "mayPercentage": 8.33,
      "flowInstanceId": null,
      "mayMay": 6666666.666666667,
      "total": 80000000,
      "decDecember": 6666666.666666667,
      "junePercentage": 8.33,
      "januaryPercentage": 8.33,
      "totalPercentage": 100,
      "formEntityName": "Self Organization Info Form",
      "novemberPercentage": 8.33,
      "qOnePercentage": 25,
      "userId": 10248,
      "qFour": 20000000,
      "allocationMode": [
        {
          "label": "按月度",
          "value": "byMonthly"
        }
      ],
      "organizationType": [
        {
          "pbcToken": "basic-system-setting",
          "code": "company",
          "label_i18n_zh-CN": "\uD83C\uDFD9 公司",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "\uD83C\uDFD9 Company",
          "label_i18n_ja-JP": "\uD83C\uDFD9 会社",
          "label": "\uD83C\uDFD9 公司",
          "id": 21053,
          "value": "21053"
        }
      ],
      "julyPercentage": 8.33,
      "deleted": false,
      "marchPercentage": 8.33,
      "inputMethod": [
        {
          "label": "绝对值",
          "value": "absoluteValue"
        }
      ],
      "aprilPercentage": 8.33,
      "aprApril": 6666666.666666667
    }
  ],
  "metaData": {}
}
```

### rest2 产品线

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v3/form-entity-data/basic-system-setting/data-dictionary/lis>

#### payload

```json
{
  "filterModel": [
    {
      "colId": "parentHandle",
      "filterType": "text",
      "type": "equals",
      "filter": "productSeries"
    }
  ],
  "needCount": false,
  "selectColId": ["code", "codeName"]
}
```

#### response

```json
{
  "count": 5,
  "results": [
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": null,
      "pbcToken": "basic-system-setting",
      "code": "coreMaking",
      "updateUserId": null,
      "codeName_i18n_zh-CN": "制芯",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 0,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "制芯",
      "createdTime": "2026-06-29T06:12:26.524+00:00",
      "parallelStreamIndex": 0,
      "id": 25938,
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": null,
      "pbcToken": "basic-system-setting",
      "code": "lowPressure",
      "updateUserId": null,
      "codeName_i18n_zh-CN": "低压",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 0,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "低压",
      "createdTime": "2026-06-29T06:12:12.764+00:00",
      "parallelStreamIndex": 1,
      "id": 25937,
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": null,
      "pbcToken": "basic-system-setting",
      "code": "gravity",
      "updateUserId": null,
      "codeName_i18n_zh-CN": "重力",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 0,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "重力",
      "createdTime": "2026-06-29T06:11:59.487+00:00",
      "parallelStreamIndex": 2,
      "id": 25936,
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": null,
      "pbcToken": "basic-system-setting",
      "code": "postProcessing",
      "updateUserId": null,
      "codeName_i18n_zh-CN": "后处理",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 0,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "后处理",
      "createdTime": "2026-06-29T06:11:48.341+00:00",
      "parallelStreamIndex": 3,
      "id": 25935,
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": null,
      "pbcToken": "basic-system-setting",
      "code": "others",
      "updateUserId": null,
      "codeName_i18n_zh-CN": "其他",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 0,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "其他",
      "createdTime": "2026-06-29T05:46:58.916+00:00",
      "parallelStreamIndex": 4,
      "id": 25899,
      "nodeId": null
    }
  ],
  "metaData": {}
}
```

### rest3 阶段信息

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v2/form-entity-data/basic-system-setting/data-dictionary/list>

#### payload

```json
{
  "filterModel": [
    {
      "colId": "parentHandle",
      "filterType": "text",
      "type": "equals",
      "filter": "opportunityStage"
    },
    {
      "colId": "label",
      "filterType": "text",
      "type": "contains",
      "filter": "CRM"
    }
  ],
  "needCount": false,
  "selectColId": ["code", "codeName"]
}
```

#### response

```json
{
  "count": 6,
  "results": [
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "Intentional Communication",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "初步判断",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "意向確認",
      "codeName": "初步判断",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 0,
      "id": 21274,
      "codeName_i18n_en-US": "Qualification",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "Requirements Determination",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "深度探索",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "需要発掘",
      "codeName": "深度探索",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 1,
      "id": 21273,
      "codeName_i18n_en-US": "Discovery",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "proposal",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "报价",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "見積提示",
      "codeName": "报价",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 2,
      "id": 21272,
      "codeName_i18n_en-US": "Proposal",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "negotiation",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "谈判",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "交渉中",
      "codeName": "谈判 ",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 3,
      "id": 21271,
      "codeName_i18n_en-US": "Negotiation",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "Winning Orders",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "赢单",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "受注",
      "codeName": "赢单",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 4,
      "id": 21270,
      "codeName_i18n_en-US": "Closed Won",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "Single Loss",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "输单",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "失注",
      "codeName": "输单",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 5,
      "id": 21269,
      "codeName_i18n_en-US": "Closed Lost",
      "nodeId": null
    }
  ],
  "metaData": {}
}
`  "metaData": {}
}
```

### rest4 线索

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v2/form-entity-data/lead-management/lead-management-form/list>

#### payload

```json
{
  "filterModel": [
    {
      "colId": "expectedDealTime",
      "filterType": "date",
      "type": "inRange",
      "dateFrom": "2026-01-01",
      "dateTo": "2026-12-31"
    }
  ],
  "selectColId": ["expectedDealTime"]
}
```

#### response

```json
{
  "count": 2,
  "results": [
    {
      "formEntityName": "Lead Management Form",
      "updatedTime": "2026-07-14T06:29:09.894+00:00",
      "pbcToken": "lead-management",
      "updateUserId": 10249,
      "userId": 10255,
      "flowInstanceId": 143623,
      "threadId": "143623",
      "objectVersion": 6,
      "deleted": false,
      "formEntityId": 1550,
      "formEntityToken": "lead-management-form",
      "createdTime": "2026-07-14T06:27:10.790+00:00",
      "parallelStreamIndex": 0,
      "id": 32935,
      "nodeId": 1,
      "expectedDealTime": "2026-10-01"
    },
    {
      "formEntityName": "Lead Management Form",
      "updatedTime": "2026-07-14T02:17:18.921+00:00",
      "pbcToken": "lead-management",
      "updateUserId": 10249,
      "userId": 10255,
      "flowInstanceId": 142780,
      "threadId": "142780",
      "objectVersion": 14,
      "deleted": false,
      "formEntityId": 1550,
      "formEntityToken": "lead-management-form",
      "createdTime": "2026-07-13T08:08:28.752+00:00",
      "parallelStreamIndex": 1,
      "id": 32530,
      "nodeId": 1,
      "expectedDealTime": "2026-07-31"
    }
  ],

  "metaData": {}
}
```

### rest5 货币数据字典

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v3/form-entity-data/basic-system-setting/data-dictionary/list>

#### payload

```json
{
  "filterModel": [
    {
      "colId": "parentHandle",
      "filterType": "text",
      "type": "equals",
      "filter": "settlementCurrency"
    }
  ],
  "needCount": false,
  "selectColId": ["code", "codeName"]
}
```

#### response

```json
{
  "count": 10,
  "results": [
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-07-09T01:59:45.724+00:00",
      "pbcToken": "basic-system-setting",
      "code": "CNY",
      "updateUserId": 10248,
      "codeName_i18n_zh-CN": "人民币",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "人民币",
      "createdTime": "2026-06-29T05:34:53.765+00:00",
      "parallelStreamIndex": 0,
      "id": 25887,
      "codeName_i18n_en-US": "CNY",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-07-09T02:00:29.996+00:00",
      "pbcToken": "basic-system-setting",
      "code": "SGD",
      "updateUserId": 10248,
      "codeName_i18n_zh-CN": "新加坡元",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 2,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "新加坡元",
      "createdTime": "2026-06-25T07:44:40.818+00:00",
      "parallelStreamIndex": 1,
      "id": 24824,
      "codeName_i18n_en-US": "SGD",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-07-09T02:01:52.808+00:00",
      "pbcToken": "basic-system-setting",
      "code": "CHF",
      "updateUserId": 10248,
      "codeName_i18n_zh-CN": "瑞士法郎",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 2,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "瑞士法郎",
      "createdTime": "2026-06-25T07:44:33.503+00:00",
      "parallelStreamIndex": 2,
      "id": 24823,
      "codeName_i18n_en-US": "CHF",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-07-09T02:03:20.383+00:00",
      "pbcToken": "basic-system-setting",
      "code": "CAD",
      "updateUserId": 10248,
      "codeName_i18n_zh-CN": "加拿大元",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 2,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "加拿大元",
      "createdTime": "2026-06-25T07:44:26.348+00:00",
      "parallelStreamIndex": 3,
      "id": 24822,
      "codeName_i18n_en-US": "CAD",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-25T07:45:11.451+00:00",
      "pbcToken": "basic-system-setting",
      "code": "AUD",
      "updateUserId": 10248,
      "codeName_i18n_zh-CN": "澳大利亚元",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "澳大利亚元",
      "createdTime": "2026-06-25T07:44:18.448+00:00",
      "parallelStreamIndex": 4,
      "id": 24821,
      "codeName_i18n_en-US": "AUD",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-25T07:44:59.151+00:00",
      "pbcToken": "basic-system-setting",
      "code": "HKD",
      "updateUserId": 10248,
      "codeName_i18n_zh-CN": "港元",
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName": "港元",
      "createdTime": "2026-06-25T07:44:09.453+00:00",
      "parallelStreamIndex": 5,
      "id": 24820,
      "codeName_i18n_en-US": "HKD",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "GBP",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "英镑",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "英ポンド",
      "codeName": "英镑",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 6,
      "id": 21175,
      "codeName_i18n_en-US": "GBP",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "JPY",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "日元",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "円",
      "codeName": "日元",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 7,
      "id": 21173,
      "codeName_i18n_en-US": "JPY",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "EUR",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "欧元",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "ユーロ",
      "codeName": "欧元",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 8,
      "id": 21172,
      "codeName_i18n_en-US": "EUR",
      "nodeId": null
    },
    {
      "formEntityName": "Data Dictionary",
      "updatedTime": "2026-06-08T10:47:15.045+00:00",
      "pbcToken": "basic-system-setting",
      "code": "USD",
      "updateUserId": 10249,
      "codeName_i18n_zh-CN": "美元",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "deleted": false,
      "formEntityId": 1523,
      "formEntityToken": "data-dictionary",
      "codeName_i18n_ja-JP": "米ドル",
      "codeName": "美元",
      "createdTime": "2026-06-08T10:01:00.683+00:00",
      "parallelStreamIndex": 9,
      "id": 21171,
      "codeName_i18n_en-US": "USD",
      "nodeId": null
    }
  ],
  "metaData": {}
}
```

### rest6 换算

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v3/form-entity-data/basic-system-setting/exchange-rate-management-form/list>

#### payload

```json
{
  "startRow": 0,
  "endRow": 10000,
  "selectColId": ["fromCurrency", "toCurrency", "rate"]
}
```

#### response

```json
{
  "count": 5,
  "results": [
    {
      "formEntityName": "汇率管理",
      "updatedTime": "2026-06-30T01:55:35.379+00:00",
      "pbcToken": "basic-system-setting",
      "updateUserId": 10263,
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 2,
      "deleted": false,
      "toCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "25887"
        }
      ],
      "rate": "0.042122",
      "formEntityId": 1641,
      "formEntityToken": "exchange-rate-management-form",
      "createdTime": "2026-06-24T07:56:10.134+00:00",
      "parallelStreamIndex": 0,
      "fromCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "日元",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "JPY",
          "label_i18n_ja-JP": "円",
          "label": "日元",
          "id": 21173,
          "value": "21173"
        }
      ],
      "id": 24663,
      "nodeId": null
    },
    {
      "formEntityName": "汇率管理",
      "updatedTime": "2026-07-09T02:04:02.630+00:00",
      "pbcToken": "basic-system-setting",
      "updateUserId": 10248,
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 3,
      "deleted": false,
      "toCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "25887"
        }
      ],
      "rate": "0.86975",
      "formEntityId": 1641,
      "formEntityToken": "exchange-rate-management-form",
      "createdTime": "2026-06-24T07:55:43.923+00:00",
      "parallelStreamIndex": 1,
      "fromCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "formEntityToken": "data-dictionary",
          "label": "港币",
          "id": 21170,
          "value": "21170"
        }
      ],
      "id": 24662,
      "nodeId": null
    },
    {
      "formEntityName": "汇率管理",
      "updatedTime": "2026-06-30T01:55:52.810+00:00",
      "pbcToken": "basic-system-setting",
      "updateUserId": 10263,
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 2,
      "deleted": false,
      "toCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "25887"
        }
      ],
      "rate": "8.9818",
      "formEntityId": 1641,
      "formEntityToken": "exchange-rate-management-form",
      "createdTime": "2026-06-24T07:54:58.643+00:00",
      "parallelStreamIndex": 2,
      "fromCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "英镑",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "GBP",
          "label_i18n_ja-JP": "英ポンド",
          "label": "英镑",
          "id": 21175,
          "value": "21175"
        }
      ],
      "id": 24661,
      "nodeId": null
    },
    {
      "formEntityName": "汇率管理",
      "updatedTime": "2026-07-09T02:03:57.788+00:00",
      "pbcToken": "basic-system-setting",
      "updateUserId": 10248,
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 4,
      "deleted": false,
      "toCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "25887"
        }
      ],
      "rate": "7.7434",
      "formEntityId": 1641,
      "formEntityToken": "exchange-rate-management-form",
      "createdTime": "2026-06-24T07:54:11.127+00:00",
      "parallelStreamIndex": 3,
      "fromCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "欧元",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "EUR",
          "label_i18n_ja-JP": "ユーロ",
          "label": "欧元",
          "id": 21172,
          "value": "21172"
        }
      ],
      "id": 24660,
      "nodeId": null
    },
    {
      "formEntityName": "汇率管理",
      "updatedTime": "2026-07-09T02:03:52.719+00:00",
      "pbcToken": "basic-system-setting",
      "updateUserId": 10248,
      "userId": 10248,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 3,
      "deleted": false,
      "toCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "25887"
        }
      ],
      "rate": "6.8195",
      "formEntityId": 1641,
      "formEntityToken": "exchange-rate-management-form",
      "createdTime": "2026-06-24T07:53:47.134+00:00",
      "parallelStreamIndex": 4,
      "fromCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "美元",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "USD",
          "label_i18n_ja-JP": "米ドル",
          "label": "美元",
          "id": 21171,
          "value": "21171"
        }
      ],
      "id": 24659,
      "nodeId": null
    }
  ],
  "metaData": {}
}
```

### rest7 商机

settlementCurrency 用的是code

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v2/form-entity-data/opportunity-management/opportunity-management-form/list>

#### payload

```json
{
  "filterModel": [
    {
      "colId": "expectedDealTime",
      "filterType": "date",
      "type": "inRange",
      "dateFrom": "2026-01-01",
      "dateTo": "2026-12-31"
    }
  ],
  "selectColId": [
    "expectedDealTime",
    "creationTime",
    "opportunityName",
    "customerName",
    "expectedTransactionAmount",
    "opportunityStage",
    "eventDate",
    "winRate",
    "opportunityOwner",
    "productLine",
    "businessAmount",
    "contractNumber",
    "settlementCurrency"
  ]
}
```

#### response

```json
{
  "count": 17,
  "results": [
    {
      "creationTime": "2026-07-14 14:29:08",
      "expectedTransactionAmount": 10000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Intentional Communication",
          "label_i18n_zh-CN": "初步判断",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Qualification",
          "handle": "opportunityStage-Intentional Communication",
          "remark": null,
          "label_i18n_ja-JP": "意向確認",
          "label": "初步判断",
          "id": 21274,
          "value": "21274"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-14T06:29:08.904+00:00",
      "parallelStreamIndex": 0,
      "id": 32942,
      "businessAmount": 0,
      "expectedDealTime": "2026-10-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": null,
      "pbcToken": "opportunity-management",
      "opportunityName": "无机制芯",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "uid": "10255",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "薛培锋",
          "value": "295"
        }
      ],
      "updateUserId": null,
      "userId": 10249,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "广东鸿图科技股份有限公司",
          "id": 32929,
          "value": "32929"
        }
      ],
      "objectVersion": 0,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 25,
      "nodeId": null
    },
    {
      "creationTime": "2026-07-14 10:17:17",
      "expectedTransactionAmount": 3000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "proposal",
          "label_i18n_zh-CN": "报价",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Proposal",
          "handle": "opportunityStage-proposal",
          "remark": null,
          "label_i18n_ja-JP": "見積提示",
          "label": "报价",
          "id": 21272,
          "value": "21272"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-14T02:17:18.022+00:00",
      "parallelStreamIndex": 1,
      "id": 32777,
      "businessAmount": 0,
      "expectedDealTime": "2026-07-31",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": null,
      "pbcToken": "opportunity-management",
      "opportunityName": "自动制芯线",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "uid": "10255",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "薛培锋",
          "value": "295"
        }
      ],
      "updateUserId": null,
      "userId": 10249,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "湖南嘉力机械有限公司",
          "value": "32583"
        }
      ],
      "objectVersion": 0,
      "settlementCurrency": [],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 30,
      "nodeId": null
    },
    {
      "creationTime": "2026-07-14T01:43:56.155Z",
      "expectedTransactionAmount": 7000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "proposal",
          "label_i18n_zh-CN": "报价",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Proposal",
          "handle": "opportunityStage-proposal",
          "remark": null,
          "label_i18n_ja-JP": "見積提示",
          "label": "报价",
          "id": 21272,
          "value": "21272"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-14T01:44:30.064+00:00",
      "parallelStreamIndex": 2,
      "id": 32768,
      "businessAmount": 0,
      "expectedDealTime": "2026-09-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-14T01:45:28.471+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "卡钳后处理项目",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10253,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "三友未来（重庆）智能汽车底盘科技有限公司",
          "id": 32767,
          "value": "32767"
        }
      ],
      "objectVersion": 1,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 50,
      "nodeId": null
    },
    {
      "creationTime": "2026-07-13T07:27:20.643Z",
      "expectedTransactionAmount": 1000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Intentional Communication",
          "label_i18n_zh-CN": "初步判断",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Qualification",
          "handle": "opportunityStage-Intentional Communication",
          "remark": null,
          "label_i18n_ja-JP": "意向確認",
          "label": "初步判断",
          "id": 21274,
          "value": "21274"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "制芯",
          "formEntityToken": "data-dictionary",
          "label": "制芯",
          "id": 25938,
          "value": "25938"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-13T07:28:22.666+00:00",
      "parallelStreamIndex": 3,
      "id": 32031,
      "businessAmount": 0,
      "expectedDealTime": "2026-08-31",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T07:37:49.438+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "测试",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "胡剑飞",
          "value": "jeff.hu@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10257,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": "",
          "formEntityToken": "customer-management-form",
          "label": "Indus Ideas Distributor",
          "id": 29614,
          "value": "29614"
        }
      ],
      "objectVersion": 2,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 50,
      "nodeId": null
    },
    {
      "creationTime": "2026-07-13T04:25:30.242Z",
      "expectedTransactionAmount": 10000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "proposal",
          "label_i18n_zh-CN": "报价",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Proposal",
          "handle": "opportunityStage-proposal",
          "remark": null,
          "label_i18n_ja-JP": "見積提示",
          "label": "报价",
          "id": 21272,
          "value": "21272"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-13T04:26:23.443+00:00",
      "parallelStreamIndex": 4,
      "id": 30247,
      "businessAmount": 0,
      "expectedDealTime": "2026-08-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-15T10:14:13.625+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "制芯自动化生产线",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": "重庆市铜梁区东城街道办事处龙腾大道688号",
          "formEntityToken": "customer-management-form",
          "label": "重庆庆兰实业有限公司",
          "id": 25874,
          "value": "25874"
        }
      ],
      "objectVersion": 7,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 50,
      "nodeId": null,
      "eventDate": "2026/7/13 12:41:27"
    },
    {
      "creationTime": "2026-07-13T02:34:11.551Z",
      "expectedTransactionAmount": 2500000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Requirements Determination",
          "label_i18n_zh-CN": "深度探索",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Discovery",
          "handle": "opportunityStage-Requirements Determination",
          "remark": null,
          "label_i18n_ja-JP": "需要発掘",
          "label": "深度探索",
          "id": 21273,
          "value": "21273"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "重力",
          "formEntityToken": "data-dictionary",
          "label": "重力",
          "id": 25936,
          "value": "25936"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-13T02:35:20.049+00:00",
      "parallelStreamIndex": 5,
      "id": 30074,
      "businessAmount": 0,
      "expectedDealTime": "2026-07-20",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T06:12:01.929+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "重力铸造单元",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "东风精密铸造有限公司",
          "id": 30072,
          "value": "30072"
        }
      ],
      "objectVersion": 4,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 50,
      "nodeId": null,
      "eventDate": "2026/7/13 14:10:50"
    },
    {
      "creationTime": "2026-07-06T07:51:48.150Z",
      "expectedTransactionAmount": 100000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Requirements Determination",
          "label_i18n_zh-CN": "深度探索",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Discovery",
          "handle": "opportunityStage-Requirements Determination",
          "remark": null,
          "label_i18n_ja-JP": "需要発掘",
          "label": "深度探索",
          "id": 21273,
          "value": "21273"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-06T07:52:22.538+00:00",
      "parallelStreamIndex": 6,
      "id": 27814,
      "businessAmount": 9643.4,
      "expectedDealTime": "2026-07-06",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-15T10:18:55.903+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "测试报价20260706！！！",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "Admin",
          "value": "Admin@fld.com"
        }
      ],
      "updateUserId": 10248,
      "userId": 10248,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "这是一条测试数据！！",
          "id": 24115,
          "value": "24115"
        }
      ],
      "objectVersion": 4,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "nodeId": null
    },
    {
      "creationTime": "2026-07-06T07:28:34.095Z",
      "expectedTransactionAmount": 500000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Winning Orders",
          "label_i18n_zh-CN": "赢单",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Closed Won",
          "handle": "opportunityStage-Winning Orders",
          "remark": null,
          "label_i18n_ja-JP": "受注",
          "label": "赢单",
          "id": 21270,
          "value": "21270"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-06T07:29:15.916+00:00",
      "parallelStreamIndex": 7,
      "id": 27785,
      "businessAmount": 28250.0,
      "expectedDealTime": "2026-07-16",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-15T05:37:16.395+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "Opporunity from lead1528",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "Admin",
          "value": "Admin@fld.com"
        }
      ],
      "updateUserId": 10249,
      "contractNumber": "20260706-1529",
      "userId": 10248,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "这是一条测试数据！！",
          "id": 24115,
          "value": "24115"
        }
      ],
      "objectVersion": 9,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 88,
      "nodeId": null
    },
    {
      "creationTime": "2026-07-03T01:13:27.783Z",
      "expectedTransactionAmount": 1800000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Winning Orders",
          "label_i18n_zh-CN": "赢单",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Closed Won",
          "handle": "opportunityStage-Winning Orders",
          "remark": null,
          "label_i18n_ja-JP": "受注",
          "label": "赢单",
          "id": 21270,
          "value": "21270"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "制芯",
          "formEntityToken": "data-dictionary",
          "label": "制芯",
          "id": 25938,
          "value": "25938"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-03T01:14:09.041+00:00",
      "parallelStreamIndex": 8,
      "id": 27243,
      "businessAmount": 0,
      "expectedDealTime": "2026-07-06",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T06:58:20.956+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "恒立墨西哥工厂冷芯单元",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "contractNumber": "1",
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "江苏恒立液压股份有限公司常州铸造分公司",
          "id": 26072,
          "value": "26072"
        }
      ],
      "objectVersion": 6,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 100,
      "nodeId": null,
      "eventDate": "2026/7/13 12:51:08"
    },
    {
      "creationTime": "2026-07-01T01:10:33.328Z",
      "expectedTransactionAmount": 10000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Requirements Determination",
          "label_i18n_zh-CN": "深度探索",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Discovery",
          "handle": "opportunityStage-Requirements Determination",
          "remark": null,
          "label_i18n_ja-JP": "需要発掘",
          "label": "深度探索",
          "id": 21273,
          "value": "21273"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-07-01T01:11:32.889+00:00",
      "parallelStreamIndex": 9,
      "id": 26554,
      "businessAmount": 0,
      "expectedDealTime": "2026-09-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-01T01:19:24.347+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "H臂制芯、低压、后处理",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10253,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "昆山六丰机械工业有限公司",
          "id": 25929,
          "value": "25929"
        }
      ],
      "objectVersion": 1,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "nodeId": null
    },
    {
      "creationTime": "2026-06-30T11:35:15.140Z",
      "expectedTransactionAmount": 16000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Requirements Determination",
          "label_i18n_zh-CN": "深度探索",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Discovery",
          "handle": "opportunityStage-Requirements Determination",
          "remark": null,
          "label_i18n_ja-JP": "需要発掘",
          "label": "深度探索",
          "id": 21273,
          "value": "21273"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-30T11:36:05.461+00:00",
      "parallelStreamIndex": 10,
      "id": 26439,
      "businessAmount": 0,
      "expectedDealTime": "2026-06-30",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-06-30T11:41:41.327+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "测试商机跟进情况1935",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "Admin",
          "value": "Admin@fld.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10248,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "这是一条测试数据！！",
          "id": 24115,
          "value": "24115"
        }
      ],
      "objectVersion": 5,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "nodeId": null,
      "eventDate": "2026/6/30 19:36:24"
    },
    {
      "creationTime": "2026-06-30T07:24:30.211Z",
      "expectedTransactionAmount": 1300000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Single Loss",
          "label_i18n_zh-CN": "输单",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Closed Lost",
          "handle": "opportunityStage-Single Loss",
          "remark": null,
          "label_i18n_ja-JP": "失注",
          "label": "输单",
          "id": 21269,
          "value": "21269"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "制芯",
          "formEntityToken": "data-dictionary",
          "label": "制芯",
          "id": 25938,
          "value": "25938"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-30T07:24:56.512+00:00",
      "parallelStreamIndex": 11,
      "id": 26315,
      "businessAmount": 0,
      "expectedDealTime": "2026-06-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T06:31:04.872+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "冷芯机",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "山西千军智造科技有限公司",
          "id": 26314,
          "value": "26314"
        }
      ],
      "objectVersion": 8,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "nodeId": null
    },
    {
      "creationTime": "2026-06-29T07:43:58.354Z",
      "expectedTransactionAmount": 10000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Intentional Communication",
          "label_i18n_zh-CN": "初步判断",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Qualification",
          "handle": "opportunityStage-Intentional Communication",
          "remark": null,
          "label_i18n_ja-JP": "意向確認",
          "label": "初步判断",
          "id": 21274,
          "value": "21274"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "制芯",
          "formEntityToken": "data-dictionary",
          "label": "制芯",
          "id": 25938,
          "value": "25938"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-29T07:44:31.405+00:00",
      "parallelStreamIndex": 12,
      "id": 26081,
      "businessAmount": 0,
      "expectedDealTime": "2026-10-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T04:38:09.159+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "自动化制芯生产线",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": "天津新技术产业园区北辰科技工业园津围公路东",
          "formEntityToken": "customer-management-form",
          "label": "高丘六和（天津）工业有限公司",
          "id": 25913,
          "value": "25913"
        }
      ],
      "objectVersion": 12,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 50,
      "nodeId": null,
      "eventDate": "2026/7/13 12:35:17"
    },
    {
      "creationTime": "2026-06-29T07:42:56.965Z",
      "expectedTransactionAmount": 15000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "proposal",
          "label_i18n_zh-CN": "报价",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Proposal",
          "handle": "opportunityStage-proposal",
          "remark": null,
          "label_i18n_ja-JP": "見積提示",
          "label": "报价",
          "id": 21272,
          "value": "21272"
        }
      ],
      "productLine": [],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-29T07:43:31.109+00:00",
      "parallelStreamIndex": 13,
      "id": 26080,
      "businessAmount": 0,
      "expectedDealTime": "2026-08-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-14T01:48:21.599+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "自动化制芯生产线（冷芯）",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "AAPICO MAIA S.A.",
          "id": 25934,
          "value": "25934"
        }
      ],
      "objectVersion": 4,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "nodeId": null,
      "eventDate": "2026/7/14 09:47:56"
    },
    {
      "creationTime": "2026-06-29T07:25:04.432Z",
      "expectedTransactionAmount": 5000000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "Requirements Determination",
          "label_i18n_zh-CN": "深度探索",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Discovery",
          "handle": "opportunityStage-Requirements Determination",
          "remark": null,
          "label_i18n_ja-JP": "需要発掘",
          "label": "深度探索",
          "id": 21273,
          "value": "21273"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "重力",
          "formEntityToken": "data-dictionary",
          "label": "重力",
          "id": 25936,
          "value": "25936"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-29T07:25:51.041+00:00",
      "parallelStreamIndex": 14,
      "id": 26066,
      "businessAmount": 0,
      "expectedDealTime": "2026-08-01",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T06:05:31.403+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "重力铸造单元",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "苏州众捷汽车零部件股份有限公司",
          "id": 25932,
          "value": "25932"
        }
      ],
      "objectVersion": 2,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 50,
      "nodeId": null,
      "eventDate": "2026/7/13 14:05:14"
    },
    {
      "creationTime": "2026-06-29T03:13:56.389Z",
      "expectedTransactionAmount": 6500000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "negotiation",
          "label_i18n_zh-CN": "谈判",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Negotiation",
          "handle": "opportunityStage-negotiation",
          "remark": null,
          "label_i18n_ja-JP": "交渉中",
          "label": "谈判 ",
          "id": 21271,
          "value": "21271"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "制芯",
          "formEntityToken": "data-dictionary",
          "label": "制芯",
          "id": 25938,
          "value": "25938"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-29T03:14:25.408+00:00",
      "parallelStreamIndex": 15,
      "id": 25764,
      "businessAmount": 0,
      "expectedDealTime": "2026-07-03",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T04:46:59.568+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "自动化制芯生产线",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": null,
          "formEntityToken": "customer-management-form",
          "label": "永茂泰墨西哥工厂",
          "id": 25760,
          "value": "25760"
        }
      ],
      "objectVersion": 6,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 100,
      "nodeId": null,
      "eventDate": "2026/7/13 12:46:41"
    },
    {
      "creationTime": "2026-06-29T03:10:44.728Z",
      "expectedTransactionAmount": 1500000,
      "flowInstanceId": null,
      "opportunityStage": [
        {
          "pbcToken": "basic-system-setting",
          "code": "negotiation",
          "label_i18n_zh-CN": "谈判",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "Negotiation",
          "handle": "opportunityStage-negotiation",
          "remark": null,
          "label_i18n_ja-JP": "交渉中",
          "label": "谈判 ",
          "id": 21271,
          "value": "21271"
        }
      ],
      "productLine": [
        {
          "pbcToken": "basic-system-setting",
          "label_i18n_zh-CN": "制芯",
          "formEntityToken": "data-dictionary",
          "label": "制芯",
          "id": 25938,
          "value": "25938"
        }
      ],
      "threadId": null,
      "formEntityId": 1494,
      "createdTime": "2026-06-29T03:12:10.971+00:00",
      "parallelStreamIndex": 16,
      "id": 25759,
      "businessAmount": 0,
      "expectedDealTime": "2026-07-03",
      "formEntityName": "Opportunity Management Form",
      "updatedTime": "2026-07-13T06:33:05.047+00:00",
      "pbcToken": "opportunity-management",
      "opportunityName": "自动化制芯单元",
      "opportunityOwner": [
        {
          "pbcToken": "user-management-new",
          "formEntityToken": "system-user-form",
          "label": "王晗丞",
          "value": "hc.wang@forlandholding.com"
        }
      ],
      "updateUserId": 10249,
      "userId": 10253,
      "customerName": [
        {
          "pbcToken": "customer-management",
          "address": "安徽省宣城市广德市新杭镇流洞村村东组",
          "formEntityToken": "customer-management-form",
          "label": "安徽永茂泰汽车零部件有限公司",
          "id": 25743,
          "value": "25743"
        }
      ],
      "objectVersion": 3,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityToken": "opportunity-management-form",
      "winRate": 100,
      "nodeId": null,
      "eventDate": "2026/7/13 14:32:48"
    }
  ],
  "metaData": {}
}
```

### rest8 合同

settlementCurrency 用的是code

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v3/form-entity-data/contract-management/contract-management-form/list>

#### payload

```json
{
  "filterModel": [
    {
      "colId": "contractCode",
      "filterType": "set",
      "values": ["1", "20260706-1529"]
    }
  ],
  "selectColId": [
    "contractCode",
    "contractName",
    "customer",
    "contractOwner",
    "totalAmountWithTax",
    "signingDate",
    "expiryDate",
    "settlementCurrency"
  ]
}
```

#### response

```json
{
  "count": 2,
  "results": [
    {
      "formEntityName": "[New]Contract Management Form",
      "updatedTime": "2026-07-13T09:20:11.151+00:00",
      "pbcToken": "contract-management",
      "updateUserId": 10248,
      "signingDate": "2026-07-16",
      "userId": 10249,
      "flowInstanceId": null,
      "expiryDate": "2026-08-31",
      "threadId": null,
      "objectVersion": 10,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "contractOwner": [
        {
          "pbcToken": "user-management-new",
          "uid": "10248",
          "phone": null,
          "formEntityToken": "system-user-form",
          "directReportManager": [],
          "nickName": "Admin",
          "organization": [],
          "label": "Admin",
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "Admin@fld.com"
        }
      ],
      "formEntityId": 1552,
      "totalAmountWithTax": 28250,
      "formEntityToken": "contract-management-form",
      "createdTime": "2026-07-06T07:31:18.790+00:00",
      "parallelStreamIndex": 0,
      "contractName": "Opporunity from lead1528",
      "id": 27790,
      "contractCode": "20260706-1529",
      "nodeId": null,
      "customer": [
        {
          "value": "24115",
          "label": "这是一条测试数据！！",
          "i18nLabel": {}
        }
      ]
    },
    {
      "formEntityName": "[New]Contract Management Form",
      "updatedTime": "2026-07-06T07:30:18.975+00:00",
      "pbcToken": "contract-management",
      "updateUserId": 10249,
      "signingDate": "2026-07-16",
      "userId": 10249,
      "flowInstanceId": null,
      "threadId": null,
      "objectVersion": 1,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "contractOwner": [
        {
          "pbcToken": "user-management-new",
          "uid": "10248",
          "phone": null,
          "formEntityToken": "system-user-form",
          "directReportManager": [],
          "nickName": "Admin",
          "organization": [],
          "label": "Admin",
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "Admin@fld.com"
        }
      ],
      "formEntityId": 1552,
      "totalAmountWithTax": 0,
      "formEntityToken": "contract-management-form",
      "createdTime": "2026-07-06T07:30:18.181+00:00",
      "parallelStreamIndex": 1,
      "contractName": "Opporunity from lead1528",
      "id": 27789,
      "contractCode": "20260706-1529",
      "nodeId": null,
      "customer": [
        {
          "value": "24115",
          "label": "这是一条测试数据！！",
          "i18nLabel": {}
        }
      ]
    }
  ],
  "metaData": {}
}
```

### rest9 应收

settlementCurrency 用的是code

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v3/form-entity-data/contract-management/receivable-plan-form/list?timestamp=1783935129351>

#### payload

```json
{
  "startRow": 0,
  "endRow": 10000,
  "filterModel": [
    {
      "colId": "parentDataId",
      "filterType": "set",
      "values": ["27789", "27790"]
    }
  ],
  "selectColId": [
    "parentDataId",
    "actualAmount",
    "actualDate",
    "plannedAmount",
    "plannedDate",
    "paymentStage",
    "paymentOwner",
    "settlementCurrency"
  ]
}
```

#### response

```json
{
  "count": 8,
  "results": [
    {
      "formEntityName": "应收计划",
      "updatedTime": null,
      "pbcToken": "contract-management",
      "updateUserId": null,
      "paymentOwner": [],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "质保金(10%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 0,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "createdTime": "2026-07-13T09:20:11.527+00:00",
      "parallelStreamIndex": 0,
      "plannedAmount": 2825,
      "id": 32604,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": null,
      "pbcToken": "contract-management",
      "updateUserId": null,
      "paymentOwner": [],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "验收款(30%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 0,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "createdTime": "2026-07-13T09:20:11.492+00:00",
      "parallelStreamIndex": 1,
      "plannedAmount": 8475,
      "id": 32603,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": null,
      "pbcToken": "contract-management",
      "updateUserId": null,
      "paymentOwner": [],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "发货款(30%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 0,
      "plannedDate": "2026-05-01",
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "createdTime": "2026-07-13T09:20:11.455+00:00",
      "parallelStreamIndex": 2,
      "plannedAmount": 5000,
      "id": 32602,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": null,
      "pbcToken": "contract-management",
      "updateUserId": null,
      "actualAmount": 8000,
      "paymentOwner": [
        {
          "pbcToken": "user-management-new",
          "uid": "10257",
          "phone": "17606525202",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "nickName": "胡剑飞",
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "胡剑飞",
          "id": 297,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "jeff.hu@forlandholding.com"
        }
      ],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "预付款(30%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 0,
      "plannedDate": "2026-06-04",
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "actualDate": "2026-07-06",
      "createdTime": "2026-07-13T09:20:11.371+00:00",
      "parallelStreamIndex": 3,
      "plannedAmount": 8475,
      "id": 32601,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": null,
      "pbcToken": "contract-management",
      "updateUserId": null,
      "paymentOwner": [],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "质保金(10%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 0,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "createdTime": "2026-07-06T07:32:12.013+00:00",
      "parallelStreamIndex": 4,
      "plannedAmount": 2825,
      "id": 27794,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": null,
      "pbcToken": "contract-management",
      "updateUserId": null,
      "paymentOwner": [],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "验收款(30%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 0,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "createdTime": "2026-07-06T07:32:11.980+00:00",
      "parallelStreamIndex": 5,
      "plannedAmount": 8475,
      "id": 27793,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": "2026-07-13T08:49:53.973+00:00",
      "pbcToken": "contract-management",
      "updateUserId": 10248,
      "paymentOwner": [],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "发货款(30%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 1,
      "plannedDate": "2026-05-01",
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "createdTime": "2026-07-06T07:32:11.946+00:00",
      "parallelStreamIndex": 6,
      "plannedAmount": 8475,
      "id": 27792,
      "nodeId": null
    },
    {
      "formEntityName": "应收计划",
      "updatedTime": "2026-07-06T09:08:00.516+00:00",
      "pbcToken": "contract-management",
      "updateUserId": 10248,
      "actualAmount": 8000,
      "paymentOwner": [
        {
          "pbcToken": "user-management-new",
          "uid": "10257",
          "phone": "17606525202",
          "formEntityToken": "system-user-form",
          "directReportManager": [
            {
              "pbcToken": "user-management-new",
              "uid": "10253",
              "phone": "18601581501",
              "formEntityToken": "system-user-form",
              "label": "王晗丞",
              "id": 293,
              "value": "293",
              "email": "hc.wang@forlandholding.com"
            }
          ],
          "nickName": "胡剑飞",
          "organization": [
            {
              "value": "21733",
              "label": "华东业务部",
              "i18nLabel": {}
            }
          ],
          "label": "胡剑飞",
          "id": 297,
          "avatar": {
            "resources": [],
            "value": null
          },
          "value": "jeff.hu@forlandholding.com"
        }
      ],
      "userId": 10248,
      "flowInstanceId": null,
      "paymentStage": "预付款(30%)",
      "parentDataId": "27790",
      "threadId": null,
      "objectVersion": 3,
      "plannedDate": "2026-06-04",
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "CNY",
          "label_i18n_zh-CN": "人民币",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "CNY",
          "label": "人民币",
          "id": 25887,
          "value": "CNY"
        }
      ],
      "deleted": false,
      "formEntityId": 1557,
      "formEntityToken": "receivable-plan-form",
      "actualDate": "2026-07-06",
      "createdTime": "2026-07-06T07:32:11.911+00:00",
      "parallelStreamIndex": 7,
      "plannedAmount": 8475,
      "id": 27791,
      "nodeId": null
    }
  ],
  "metaData": {}
}
```

### rest10 企业基本信息

settlementCurrency 用的是code

#### api

<https://fld.ceta.crm.duxing.cn/form/api/v3/form-entity-data/basic-system-setting/company-basic-config/list>

#### payload

#### response

```json
{
  "count": 2,
  "results": [
    {
      "companySlogan": "More green more power",
      "companyPostCode": "214128",
      "flowInstanceId": null,
      "threadId": null,
      "companyEmail": "sales@forlandholding.com",
      "companyPhone": "0510-85958898  85958808 ",
      "formEntityId": 1648,
      "companyFax": "0510-85958808 ",
      "createdTime": "2026-07-07T08:35:14.749+00:00",
      "parallelStreamIndex": 0,
      "id": 28036,
      "formEntityName": "公司基础配置",
      "updatedTime": "2026-07-15T09:19:46.423+00:00",
      "pbcToken": "basic-system-setting",
      "updateUserId": 10248,
      "companyLogo": {
        "resources": [
          {
            "storageId": "da7df301-411c-4724-ad56-c394d1442ef0.png",
            "fileName": "图像 (5).png",
            "url": "",
            "token": "563c8208-4b6b-4dac-9a69-694e278651aa__56fe__50cf__20__28_5_29_.png"
          }
        ],
        "value": null
      },
      "companyNameEn": "Wuxi Forland Technology Co., Ltd.",
      "userId": 10248,
      "companyShortNameEn": "Forland Tech.",
      "companyNameZh": "无锡福兰德科技有限公司",
      "objectVersion": 5,
      "settlementCurrency": [
        {
          "pbcToken": "basic-system-setting",
          "code": "SGD",
          "label_i18n_zh-CN": "新加坡元",
          "formEntityToken": "data-dictionary",
          "label_i18n_en-US": "SGD",
          "label": "新加坡元",
          "id": 24824,
          "value": "SGD"
        }
      ],
      "deleted": false,
      "formEntityToken": "company-basic-config",
      "companyAddress": "No. 518, Renbin Road, Binhu District, Wuxi, China",
      "companyWebsite": "www.forlandholding.com",
      "nodeId": null
    }
  ]
}
```
