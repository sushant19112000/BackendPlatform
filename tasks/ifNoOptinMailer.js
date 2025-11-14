"use strict";
const nodemailer = require("nodemailer");

async function ifNoOptinMailer(email, firstname) {
  console.log(email, firstname, "in mailer trigger");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "rupeshmahajan516@gmail.com",
      pass: "wwzxaibsedyggwit",
    },
  });

  const info = await transporter.sendMail({
    from: "rupeshmahajan516@gmail.com",
    to: email,
    subject: `ifNoOptinMailer`,
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>Evaluating Digital Transformation motivators in the Middle East</title>
  </head>

<body><div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;" bis_skin_checked="1">Thank you for completing the survey.</div><div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;" bis_skin_checked="1">Despite Africa’s rapid adoption of cloud technology, FinTech innovation and mobile-first growth, cybersecurity remains a key challenge.</div><!-- MAIN WRAPPER -->
<table border="0" cellpadding="0" cellspacing="0" class="main-wrapper" style="background-color: #ffffff; width: 100%;">
<tbody>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="primary-message-wrap" style="width: 100%;">
<tbody>
<tr>
<td height="15">&nbsp;</td>
</tr>
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="hero-wrap" style="width: 640px;">
<tbody>
<tr>
<td style="font-size: 11px; color: #666666; font-family: Arial, Helvetica, sans-serif;" align="center">
<div style="text-align: center;" bis_skin_checked="1"><span style="font-family: arial, helvetica, sans-serif; font-size: 11px; color: #888888;"><span style="color: #888888;"><a href="#" style="color: #000; text-decoration: none;"></a></span></span></div>
</td>
</tr>
<tr>
<td height="15">&nbsp;</td>
</tr>
</tbody>
</table>
</td>
</tr>
<!-- /Hero --> <!-- Primary Content -->
<tr>
<td>
<table align="center" border="0" cellpadding="0" cellspacing="0" class="primary-content-wrap" style="border: 1px solid #e5e5e5; width: 640px; background: #FFFFFF">
<tbody>
<tr>
<td class="mobile-pad-btm20">
<table align="center" border="0" cellpadding="0" cellspacing="0" class="primary-content">
<tbody>
	<tr>
		
<td>
<table width="610" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse: collapse; padding: 20px;">
  <tbody>
    <tr>
      <td align="center">
        <img src="https://www.dropbox.com/scl/fi/mm0k95kiosi5pib8cmxzj/Oracle-CXO-Priorities-Logo-v2.png?rlkey=dh36jrrsjfjidq9ymqqnpyqtx&st=57sewwpc&raw=1" 
             alt="Logo" 
             width="610" 
             style="display: block; width: 100%; max-width: 610px; height: auto; border: 0; " />
      </td>
    </tr>
  </tbody>
</table>

</td>


</tr>
</tbody>
</table>
</td>
	
	</tr>
	
<tr>
<td>
<table bgcolor="#fff" cellpadding="0" cellspacing="0"><!-- HERO BANNER START -->
<tbody>
<tr>
<td><a href=""><img src="https://www.dropbox.com/scl/fi/bikw1p89rmoqu6rapuucf/Oracle-Survey-Accelerating-Digital-Transformation.png?rlkey=0ule3ejpz73n0a7wsymesnlkk&st=2tkuc79n&raw=1" border="0" alt="Hero Banner" width="640" height="250"></a></td>
</tr>
<tr style="background: #b72027; margin: 0; padding: 0;">
<td>
<table bgcolor="#b72027" cellpadding="0" cellspacing="0" style="width: 638px;">
<tbody>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td width="30">&nbsp;</td>
<td style="font-family: 'Lato', sans-serif; font-size: 26px; color: #ffffff; line-height: 26px; text-align: center;"><a href="https://www.cxotechhub.com/surveys/2025-oracle-cxo-priorities-survey-evaluating-digital-transformation-motivators-in-the-middle-east-survey" target="_blank" style="text-decoration: none; color: #ffffff;">Evaluating Digital Transformation motivators in the Middle East </a></td>
</tr>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>
</td></tr>
	<tr><td><table bgcolor="#ffffff" cellpadding="0" cellspacing="0">
  <tbody>
    <tr>
      <td width="20">&nbsp;</td>
      <td><table cellpadding="0" cellspacing="0">
  <tbody>
    <tr>
      <td>&nbsp;</td>
    </tr>
		  </tbody></table>
		  <table>
			  <tbody>
    <tr>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td align="left" valign="top" style="font-family: 'Lato', sans-serif; font-size: 12px; color: #343434; line-height: 18px;">
			<p>Thank you for completing the survey. You will also receive a copy of the report once published.
            </p>
		 

	
		
		
		<p>&nbsp;</p>
		

		  
		
		</td>
		
    </tr>
    

    
  </tbody>
</table>
		  
</td>
      <td width="20">&nbsp;</td>
    </tr>
	  
	  
	  <tr><td width="20">&nbsp;</td>
		  <td>
<table align="center" width="620" border="0" cellpadding="0" cellspacing="5" style="width: 100%; max-width: 620px;" dir="ltr">
<tbody>
	<tr>
<td height="15">&nbsp;</td>
</tr>
<tr>
<td width="620" style="font-size: 11px; font-family: 'Lato', sans-serif; color: #343434;" align="center">This email was sent to .</td>
</tr>
<tr>
<td style="font-size: 11px; font-family: 'Lato', sans-serif; color: #343434;" align="center">Lynchpin Media | 63/66 Hatton Garden, London EC1N 8LE</td>
</tr>
<tr>
<td style="font-size: 11px; font-family: 'Lato', sans-serif; color: #666666;" align="center"><a href="https://lynchpin.moosend.com/unsubscribe/be29a6ca-b0a2-43a4-a517-30c8998d8886/00000000-0000-0000-0000-000000000000/" target="_blank" style="font-size: 11px; font-family: 'Lato', sans-serif; color: #3778cd"> Click here to unsubscribe</a> | <a href="https://lynchpin.moosend.com/update/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000" target="_blank" style="font-size: 11px; font-family: 'Lato', sans-serif; color: #3778cd">Update your profile</a> | <a href="http://lynchpinmedia.co.uk/privacy-policy/" target="_blank" style="font-size: 11px; font-family: 'Lato', sans-serif; color: #3778cd">Privacy Policy</a></td>
</tr>
<tr><td>&nbsp;</td></tr>
</tbody>
</table>
</td>
	  <td width="20">&nbsp;</td></tr>
  </tbody>
</table>
</td></tr>
</tbody>
</table>
<!-- HERO BANNER END --></td>
</tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="background-color: #FFFFFF"><!-- INTELLIGENT NEWS START -->
<tbody>
<tr>
<td height="15" style="line-height: 1px; font-size: 1px">&nbsp;</td>
</tr>
</tbody>
</table>
<!-- INTELLIGENT NEWS END --></td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</body>
</html>
 `,
  });
}

module.exports = ifNoOptinMailer;
