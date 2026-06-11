function createBarrierBreakersForm() {
    // 1. Create the form
    var form = FormApp.create('Barrier Breakers 2026 - Team Application');

    form.setDescription('Page 1: Team Information')
        .setConfirmationMessage("Thank you for applying! We'll review all applications and notify you by late January if your team has been selected to compete. Questions? Email competition@finmango.org");

    // -------------------------------------------------------------------------
    // Page 1: Team Information
    // -------------------------------------------------------------------------

    // Team Name
    form.addTextItem()
        .setTitle("What's your team name?")
        .setRequired(true);

    // School Name
    form.addTextItem()
        .setTitle("Which Northeast Ohio high school are you from?")
        .setRequired(true);

    // Team Members
    form.addParagraphTextItem()
        .setTitle("List all team member names (1-3 students) and grade levels")
        .setHelpText('Example: "Jane Smith (11th), John Doe (10th)"')
        .setRequired(true);

    // Contact Email
    // Note: We add a specific text item for this as requested, separate from the auto-collected email if enabled.
    var emailValidation = FormApp.createTextValidation()
        .requireTextIsEmail()
        .build();

    form.addTextItem()
        .setTitle("Best email to reach your team")
        .setRequired(true)
        .setValidation(emailValidation);

    // Teacher/Advisor Name
    form.addTextItem()
        .setTitle("Which teacher is supporting your team?")
        .setRequired(true);

    // -------------------------------------------------------------------------
    // Page 2: Your Innovation
    // -------------------------------------------------------------------------
    form.addPageBreakItem()
        .setTitle('Page 2: Your Innovation');

    // Innovation Track
    form.addMultipleChoiceItem()
        .setTitle('Innovation Track')
        .setChoiceValues([
            '🚗 Transportation',
            '🏠 Housing Affordability',
            '🏥 Healthcare Access',
            '🌟 Open Track',
            '📚 Literacy & Investment Access'
        ])
        .setRequired(true);

    // Why does this problem matter to you?
    var limit500Validation = FormApp.createParagraphTextValidation()
        .setHelpText('Character limit: 500')
        .requireTextLengthLessThanOrEqualTo(500)
        .build();

    form.addParagraphTextItem()
        .setTitle("Tell us why you chose this barrier. How does it impact your community or personal experience? (2-3 sentences)")
        .setHelpText('Character limit: 500')
        .setRequired(true)
        .setValidation(limit500Validation);

    // What's your initial solution idea?
    form.addParagraphTextItem()
        .setTitle("Briefly describe your solution. Don't worry if it's not fully developed yet! (2-3 sentences)")
        .setHelpText('Character limit: 500')
        .setRequired(true)
        .setValidation(limit500Validation);

    // -------------------------------------------------------------------------
    // Page 3: Optional Video
    // -------------------------------------------------------------------------
    form.addPageBreakItem()
        .setTitle('Page 3: Optional Video');

    // Note: File upload items require the form to be set to collect email addresses.
    // This setting allows the file upload item to work.
    form.setCollectEmail(true);

    form.addSectionHeaderItem()
        .setTitle('Team Introduction Video (Optional)')
        .setHelpText('Upload a 60-90 second video introducing your team, OR paste a YouTube/Google Drive link below.');

    // File Upload Item
    // Note: If you run this script and get an error about File Upload items, 
    // ensure you are running it in an account that supports Drive (not a restricted Workspace account preventing external sharing if applicable).
    var uploadItem = form.addFileUploadItem()
        .setTitle("Upload a 60-90 second video introducing your team")
        .setHelpText("Max 100MB")
        .setMaxFileSize(104857600); // 100MB in bytes

    // Set allowed file types to VIDEO only
    uploadItem.setAllowedTypes([FormApp.FileUploadContent.VIDEO]);

    // Link Option
    form.addTextItem()
        .setTitle("OR paste a YouTube/Google Drive link")
        .setHelpText("If you didn't upload a file above.");

    // Anything else?
    form.addParagraphTextItem()
        .setTitle("Share anything else about your team or idea!")
        .setHelpText("Anything else you want us to know?");

    // Log the URLs
    Logger.log('Form created successfully!');
    Logger.log('Edit URL: ' + form.getEditUrl());
    Logger.log('Published URL: ' + form.getPublishedUrl());
}
