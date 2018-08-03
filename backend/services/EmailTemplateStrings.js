'use strict';

exports.classReportMarkup = function(emailVars) {
    if(emailVars.lessonLanguage === 'hebrew') {
        return `<div style="margin:auto; max-width: 800px">
<p align="right" dir="auto">
התלמיד   <b>${emailVars.inviteeName}</b> מ  <b>${emailVars.className}</b> הרגע סיימ/ה את השיעור <b>${emailVars.lessonTitle}</b>!
לחצ/י על הקישור הבא כדי לראות את דוח תלמיד של השיעור של   
<b>${emailVars.inviteeName}</b>:

</p>
<p align="right">
${emailVars.studentReportLink}
</p>

 <p align="right" dir="auto">
לחצ/י על הקישור הבא כדי לראות את <b>דוח הכיתה המרוכז</b> (הדוח מתעדכן עד שאחרון התלמידים מסיים את השיעור):

</p>
<p align="right">
${emailVars.classReportLink}
</p>


<p align="right" dir="auto">
כדי להגיע לרשימת כל דוחות התלמידים אשר סיימו כבר את השיעור לחצ/י   <a href=${emailVars.allStudentReports}><b>כאן</b></a>  .  לשים לב: כדי לראות את רשימת  דוחות התלמידים המורה צריכ/ה להיות logged in.         
</p>
 
<p align="right">
            Powered by <a href="http://www.lergo.org.il/">LerGO </a><br/>
            <a href="https://docs.google.com/forms/d/1wyO39CkCTiNAP1BrJLti0GjA8eMq6rv-QcZu0Lw1-tE/viewform?usp=send_form">תנאי שירות</a> -
            <a href="https://docs.google.com/forms/d/e/1FAIpQLScGg1PjUqlNfCB-uOpk9InyGgMcjEyKD5jj8lMuKb-R3kEVyQ/viewform"> לשלוח משוב</a> -
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfL9ymX6GUbV8dGrvTv4E50525krIQMBdE48AQ0Fn_EGpF9Hg/viewform">לדווח על שימוש לרעה</a> -
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSd7GQJ3t5QkyXcc4qCqsacGMRclzEol3WIKRoKOZpgE-ERVWQ/viewform">להציע שיעור</a> -
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdYSkKCd6lSlMWMXojaqdxqkIhK5O0UTKxgCnR90USc1t24YA/viewform?usp=sf_link">למה אני מקבל/ת את האימייל הזה</a><br>
        </p>
</div>
    `;
    }else{
        return `
    <div style="margin:auto; max-width: 800px">
        <p>
            Your student  <b>${emailVars.inviteeName}</b> of class <b>${emailVars.className}</b> just finished the <b>${emailVars.lessonTitle}</b>! Click on the following link to see the <b>student lesson report</b> of <b>${emailVars.inviteeName}</b>:
        </p>
        <p>
            ${emailVars.studentReportLink}
        </p>
        
        <p>
            Click on the next link to see the <b>class report</b> (note: the class report is being updated until the last student finishes the lesson):
        </p>
       
        <p>
            ${emailVars.classReportLink}
        </p>
        
        <p>
            To reach the list of all students reports click <a href=${emailVars.allStudentReports}><b>here</b></a> (note: the teacher must be registered to the site to be able to see the list).
        </p>
        
        <p>
            Powered by <a href="http://www.lergo.org/">LerGO - Educate Yourself.</a><br/>
            <a href="https://docs.google.com/forms/d/1wyO39CkCTiNAP1BrJLti0GjA8eMq6rv-QcZu0Lw1-tE/viewform?usp=send_form">Terms of Service</a> -
            <a href="https://docs.google.com/forms/d/1YQnB8KoouFW2cJHsO_bkdxAD2ekuLYJyvaH6AuIU-Ig/viewform?usp=send_form"> Send Feedback</a> -
            <a href="https://docs.google.com/forms/d/1t_CtQxTMJlTlLRx-3lSPv8bNfw3nVXpE2B2hGkdeSMg/viewform">Report Abuse</a> -
            <a href="https://docs.google.com/forms/d/1rU6sTKskoTqrd9u1wgiX_zG0QpfWsxizxe8CdDRj4fk/viewform?usp=send_form">Suggest a Lesson</a> -
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSeFtpXck4viIM7aTo7GoZST3z2Cojjn0BNsb-o2IAz627fYsw/viewform?usp=sf_link">Why am I getting this email?</a><br>
        </p>
    </div>
`;
    }

};

exports.classReportText = function(emailVars) {

    return `Dear ${emailVars.name},

Your initial class report, ${emailVars.lessonTitle},  is ready and may be viewed by clicking on the link below;

${emailVars.studentReportLink}

Thanks,
The LerGO Team
`;


};
