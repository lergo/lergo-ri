//email notification for invitaions should be default on
db.lessonsInvitations.update({},{$set:{"emailNotification":true}},{multi:true});
