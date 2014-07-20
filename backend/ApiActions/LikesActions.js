var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');

//exports.createLessonLike = {
//    'spec': {
//        'description': 'User likes this lesson',
//        'name': 'getAllLessons',
//        'path': '/likes/lessons/{lessonId}/create',
//        // 'notes': 'Returns 200 if everything went well, otherwise returns
//        // error response',
//        'summary': 'User likes this lesson',
//        'method': 'POST',
//        'parameters': [
//            {
//                'paramType': 'path',
//                'name': 'lessonId',
//                'required': true,
//                'description': 'lesson id',
//                'type': 'ObjectID'
//            }
//
//        ],
//        'errorResponses': [
//            {
//                'code': 500,
//                'reason': 'server error'
//            }
//        ],
//        'nickname': 'createLessonLike'
//    },
//    'middlewares': [
//        middlewares.users.exists,
//        middlewares.lessons.exists
//    ],
//    'action': controllers.likes.createLessonLike
//};
