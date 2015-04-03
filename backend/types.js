/**
 *
 *
 * @module types
 *
 * @description an empty file to describe types
 *                           *
 **/


/**
 * @description an object containing data for querying the db.
 * <pre>
 * {
 *    'filter' : {},
 *    'projection' : {},
 *    'sort' : {},
 *    'paging' : {
 *        'skip' : {}
 *        'limit' : {}
 *    }
 *
 * }
 * </p>
 *
 * @typedef {object} ComplexSearchQuery
 * @property {object} filter similar to mongo's filter. depends on the collection you're querying
 * @property {object} project similar to mongo's projection. depends on the collection you're querying.
 * @property {object} sort similar to mongo's sort. depends on the collection you're querying.
 * @property {object} paging contains information of the page.
 * @property {integer} paging.skip amount of entries to skip
 * @property {integer} paging.limit amount of entries to get.
 *
 **/


/**
 * @typedef {object} EmailResources
 *
 * @property {string} lergoBaseUrl e.g. http://www.lergo.org
 * @property {string} lergoLink e.g. http://www.lergo.org/
 * @property {string} lergoLogoAbsoluteUrl e.g. http://www.lergo.org/emailResources/logo.png
 **/


/**
 *
 * @typedef {object} Invite
 * @description An invitation to do a lesson
 *
 * @property {object} lesson
 * @property {object} quizItems
 * @property {boolean} anonymous
 * @property {ObjectId} lessonId
 * @property {ObjectId|null} inviter the inviting user's Id
 * @property {object} invitee
 * @property {string} invitee.name
 *
 **/