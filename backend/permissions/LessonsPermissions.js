

exports.userCanEdit = function( lesson, user ){
    if ( !user || !lesson ){
        return false;
    }
    return  !!user.isAdmin || lesson.userId.equals(user._id) ;


};

exports.userCanCopy = function( lesson ,user ){
    return lesson.userId.equals(user._id);
};

exports.userCanDelete = function( lesson ,user ){
    return !!user.isAdmin || lesson.userId.equals(user._id);
};

exports.userCanPublish = function( lesson,user) {
    return !!user.isAdmin;
};


exports.getPermissions = function( lesson, user ){
    return {
        'canEdit' : exports.userCanEdit(lesson,user),
        'canCopy' : exports.userCanCopy(lesson,user),
        'canDelete' : exports.userCanDelete(lesson,user),
        'canPublish' : exports.userCanPublish(lesson,user)
    };
};