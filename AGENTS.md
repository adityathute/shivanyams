<!-- File Location: shivanyams/AGENTS.md -->
<!-- Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified) -->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Master rules 1–56 retained; AI-only cleanup workflow now targets 10 files per batch, with smaller batches for complex files. -->

# ShivanyaMS V2 — Repository Rulebook

## फक्त मास्टरसाठी

हा विभाग केवळ मास्टरच्या नियंत्रणाखाली आहे. या विभागात नियम जोडणे, बदलणे किंवा काढून टाकणे हे फक्त मास्टर करू शकतात. मास्टर यांच्या स्पष्ट सूचनेशिवाय कोणत्याही AI Agent किंवा Developer ने हा विभाग बदलू, हटवू, पुन्हा मांडू किंवा दुसरीकडे हलवू नये. प्रत्येक AI Agent ने येथील सर्व नियम वाचून त्यांचे पालन करावे. मास्टर यांच्या सूचनांशी सुसंगत राहण्यासाठी आवश्यक असल्यास खालील AI ONLY विभागात बदल करता येतील; मात्र या मास्टर विभागात स्वतःहून बदल करू नयेत.

### नियमावली

1. **मास्टरचा अधिकार**

   हा नियमावली विभाग फक्त मास्टरच्या नियंत्रणाखाली असेल. मास्टर यांच्या स्पष्ट परवानगीशिवाय कोणत्याही AI Agent ने या विभागातील नियम बदलू, हटवू किंवा पुनर्रचित करू नयेत.

2. **नियमांचे पालन**

   प्रत्येक AI Agent ने या विभागातील सर्व नियम काळजीपूर्वक वाचावेत आणि प्रत्येक काम करताना त्यांचे पालन करावे. कोणताही नियम दुर्लक्षित करू नये किंवा स्वतःच्या सोयीनुसार त्याचा अर्थ बदलू नये.

3. **नियमांमध्ये बदल करण्याची पद्धत**

   मास्टर यांनी नवीन नियम जोडण्यास किंवा विद्यमान नियम बदलण्यास सांगितल्यास त्यांनी दिलेला नियम क्रमांकच वापरावा. इतर नियमांचे क्रमांक किंवा मजकूर बदलू नये. नवीन नियम जोडताना आधीपासून असलेल्या नियमांची पुनरावृत्ती होणार नाही याची काळजी घ्यावी.

4. **नियमांची भाषा**

   या विभागातील सर्व नियम मराठी भाषेत लिहावेत. नियमांचा इंग्रजी अनुवाद किंवा भाषेची लेबले जोडू नयेत.

5. **कामामध्ये नियमांचा वापर आणि तांत्रिक भाषेचा वापर**

   मास्टर यांनी एखाद्या कामासाठी विशिष्ट नियम क्रमांक सांगितल्यास त्या नियमानुसार संबंधित काम पूर्ण करावे. सामान्य सूचना मराठीत समजावून सांगाव्यात; मात्र शक्य असेल तिथे CSS, TSX, JavaScript, React, Import, Component, Function, API आणि इतर Technical Terms इंग्रजीतच वापरावेत. तांत्रिक शब्दांचे अनावश्यक मराठी भाषांतर करू नये.

6. **जुन्या कोडची तपासणी**

   संपूर्ण Frontend मधील Legacy Code टप्प्याटप्प्याने तपासावा. कोणताही कोड बदलण्यापूर्वी किंवा हटवण्यापूर्वी त्याचा वापर, Dependencies, Routes, Imports आणि कार्यपद्धती तपासावी. कोणता कोड अजून आवश्यक आहे आणि कोणता वापरात नाही हे निश्चित करावे.

7. **जुन्या कोडचे व्यवस्थित संरचनेत स्थलांतर**

   Legacy Code मधील आवश्यक Functionality शक्य असेल तिथे योग्य Organized Folder आणि File Structure मध्ये हलवावी किंवा पुन्हा तयार करावी. नवीन Code लिहिताना शक्यतो Organized Structure चाच वापर करावा आणि नवीन Legacy Code तयार करणे टाळावे.

8. **अनावश्यक Legacy Code हटवणे**

   संपूर्ण Frontend मधील वापरात नसलेला, अनावश्यक आणि सुरक्षितपणे हटवता येणारा Legacy Code टप्प्याटप्प्याने काढून टाकावा. मात्र सक्रिय Features, आवश्यक Functionality किंवा Compatibility साठी वापरला जाणारा Code तपासल्याशिवाय हटवू नये. Code हटवल्यानंतर त्याच्याशी संबंधित अनावश्यक Imports, CSS आणि इतर References देखील साफ करावेत.

9. **नवीन Code ची रचना**

   नवीन Feature तयार करताना किंवा विद्यमान Feature अपडेट करताना शक्यतो योग्य Organized Folder आणि File Structure चा वापर करावा. संबंधित Code योग्य ठिकाणी ठेवावा, विद्यमान Shared Components आणि Utilities पुन्हा वापरावेत आणि एकाच Functionality साठी अनावश्यक वेगवेगळ्या Files तयार करू नयेत.

10. **नवीन Features ओळखणे**

    प्रत्येक काम करताना Project मध्ये कोणती उपयुक्त नवीन Features, सुधारणा किंवा आवश्यक Functionality जोडता येईल याचा विचार करावा. विद्यमान Features अधिक चांगल्या, सोप्या आणि उपयोगी कशा करता येतील हेही तपासावे.

11. **नवीन Features सुचवणे**

    कामादरम्यान नवीन उपयुक्त Features किंवा सुधारणा आढळल्यास त्या मास्टर यांना सुचवाव्यात. प्रत्येक सूचनेसोबत त्या Feature चा उपयोग, फायदा आणि Project मध्ये ती कुठे लागू होऊ शकते हे थोडक्यात स्पष्ट करावे.

12. **नवीन Features ची अंमलबजावणी**

    मास्टर यांनी मंजूर केलेल्या किंवा सध्याच्या कामाचा स्पष्ट भाग असलेल्या नवीन Features ची अंमलबजावणी करावी. नवीन Feature जोडताना विद्यमान Functionality, Design, Performance आणि User Experience यावर वाईट परिणाम होणार नाही याची काळजी घ्यावी. असंबंधित Features स्वतःहून जोडू नयेत.

13. **Code स्वच्छ आणि संक्षिप्त ठेवणे**

    सर्व TSX, TS आणि CSS Files मधील Code स्वच्छ, संक्षिप्त, वाचनीय आणि कार्यक्षम ठेवावा. अनावश्यक Code, Duplicate Logic, Repeated CSS आणि गरज नसलेली Abstraction टाळावी. शक्यतो कमी Code मध्ये योग्य Functionality तयार करावी; मात्र Code ची गुणवत्ता आणि समजण्यास सोपेपणा कमी होऊ देऊ नये.

14. **Class Names आणि CSS ची एकसमानता**

    प्रत्येक Feature साठी स्पष्ट, स्वतंत्र आणि योग्य Class Names वापरावेत. वेगवेगळ्या Features मध्ये एकाच Class Name ची अनावश्यक पुनरावृत्ती करू नये. Duplicate CSS Selectors, Repeated Properties आणि अनावश्यक Overrides टाळावेत. विद्यमान CSS Structure आणि Design System चा वापर करून संबंधित Styles योग्य ठिकाणी व्यवस्थित ठेवावेत.

15. **Legacy Code ची स्थिती दर्शवणारी टिप्पणी**

    एखाद्या File मध्ये Legacy Code अजूनही आवश्यक असल्यामुळे ठेवला असेल, तर त्या File मध्ये जास्तीत जास्त एक छोटी Comment देऊन Legacy Code अजून कार्यरत आहे आणि त्याची साफसफाई बाकी आहे हे नमूद करावे. Legacy Code पूर्णपणे काढून टाकल्यानंतर ती Comment देखील काढून टाकावी. अनावश्यक Comments जोडू नयेत.

16. **कामापूर्वी तपासणी आणि नियोजन**

    कोणतेही नवीन काम, Feature किंवा Code बदल सुरू करण्यापूर्वी संबंधित Files, Folders, Components, CSS, Utilities, Routes आणि Data Flow तपासावा. कोणत्या Files मध्ये बदल आवश्यक आहेत, कोणता Code पुन्हा वापरता येईल आणि कोणत्या ठिकाणी सुधारणा करावी लागेल याचे योग्य नियोजन करावे. त्यानंतरच प्रत्यक्ष अंमलबजावणी सुरू करावी.

17. **कामानंतर तपासणी आणि चाचणी**

    कोणतेही Code Changes किंवा नवीन Feature पूर्ण केल्यानंतर संबंधित Code पुन्हा तपासावा. आवश्यकतेनुसार Build, Tests आणि संबंधित Functionality तपासावी. नवीन बदलांमुळे विद्यमान Features, Responsive Design किंवा इतर Components मध्ये समस्या निर्माण झालेली नाही याची खात्री करावी. कोणतीही चाचणी केली नसल्यास ती केल्याचा दावा करू नये.

18. **विद्यमान Functionality सुरक्षित ठेवणे**

    नवीन Feature जोडताना, Code सुधारताना किंवा Legacy Code हटवताना विद्यमान Functionality विनाकारण बदलू किंवा बंद करू नये. संबंधित API, Components, Routes, Authentication, Permissions आणि इतर Dependencies योग्य प्रकारे कार्यरत राहतील याची काळजी घ्यावी. आवश्यक बदलांमुळे विद्यमान वर्तन बदलत असल्यास त्याचा परिणाम आधी तपासावा.

19. **Responsive Design आणि Layout**

    प्रत्येक नवीन Feature किंवा UI बदल करताना Mobile, Tablet आणि Desktop या सर्व Screen Sizes वर Layout योग्य प्रकारे कार्यरत राहील याची काळजी घ्यावी. Container ची उपलब्ध Width, Content Size आणि इतर Components ची जागा लक्षात घेऊन Layout तयार करावा. Text Overflow, अनावश्यक रिकामी जागा, Horizontal Scrolling आणि Components एकमेकांवर येण्याच्या समस्या टाळाव्यात. विद्यमान Design System आणि Responsive Patterns चा वापर करावा.

20. **UI Design ची एकसमानता**

    संपूर्ण Project मध्ये UI Design एकसमान, व्यावसायिक आणि वापरण्यास सोपा ठेवावा. Colors, Typography, Spacing, Borders, Shadows, Buttons, Cards, Modals आणि इतर UI Elements साठी विद्यमान Design System आणि Shared Components चा वापर करावा. नवीन Design तयार करताना इतर Pages आणि Features च्या Design शी सुसंगतता राखावी.

21. **Shared Components आणि Code Reusability**

    Project मध्ये आधीपासून उपलब्ध असलेले Shared Components, Hooks, Utilities आणि Functions तपासून त्यांचा योग्य ठिकाणी पुन्हा वापर करावा. एकाच प्रकारची Functionality वेगवेगळ्या ठिकाणी पुन्हा तयार करू नये. मात्र गरज नसताना प्रत्येक छोट्या Code साठी नवीन Shared Component तयार करू नये.

22. **Loading, Empty आणि Error States**

    प्रत्येक Feature तयार करताना किंवा अपडेट करताना आवश्यकतेनुसार Loading, Empty, Success आणि Error States व्यवस्थित हाताळाव्यात. Data उपलब्ध नसताना योग्य Empty State दाखवावी, प्रक्रिया सुरू असताना योग्य Loading Indicator दाखवावा आणि त्रुटी आल्यास वापरकर्त्याला समजेल असा Error Message दाखवावा. विद्यमान UI Design शी सुसंगतता राखावी.

23. **Data Validation आणि Security**

    Frontend आणि Backend मधील Data योग्य प्रकारे Validate करावा. User Input, API Requests, Authentication, Authorization आणि Permissions यांची योग्य तपासणी करावी. संवेदनशील माहिती सुरक्षित ठेवावी आणि अनधिकृत वापरकर्त्यांना प्रतिबंधित Data किंवा Functionality उपलब्ध होणार नाही याची खात्री करावी. Security साठी फक्त Frontend Validation वर अवलंबून राहू नये; आवश्यक तपासणी Backend वरही करावी.

24. **Performance आणि Optimization**

    नवीन Features तयार करताना आणि विद्यमान Code सुधारताना Project ची Performance चांगली राहील याची काळजी घ्यावी. अनावश्यक API Calls, Duplicate Requests, अतिरिक्त Rendering, मोठ्या Files आणि गरज नसलेले Dependencies टाळावेत. योग्य ठिकाणी Caching, Lazy Loading आणि Code Splitting यांचा वापर करावा. Optimization करताना Functionality किंवा Code Readability कमी होऊ देऊ नये.

25. **Dependencies आणि Packages व्यवस्थापन**

    नवीन Package किंवा Dependency जोडण्यापूर्वी Project मध्ये त्याच कामासाठी आधीपासून उपलब्ध पर्याय आहेत का हे तपासावे. अनावश्यक Packages जोडू नयेत. नवीन Dependency आवश्यक असल्यास तिचा उपयोग, Compatibility, Maintenance आणि Project च्या विद्यमान तंत्रज्ञानाशी सुसंगतता तपासावी. वापरात नसलेल्या Dependencies सुरक्षितपणे काढून टाकाव्यात.

26. **Git आणि Version Control व्यवस्थापन**

    कोणतेही Code Changes करण्यापूर्वी सध्याची Git स्थिती आणि संबंधित Branch तपासावी. काम पूर्ण झाल्यानंतर केलेले सर्व बदल आणि त्यांचा Diff तपासावा. अनावश्यक Files, वैयक्तिक बदल किंवा संवेदनशील माहिती Commit मध्ये समाविष्ट करू नये. Commit करताना बदलांशी संबंधित स्पष्ट आणि योग्य Commit Message वापरावा. मास्टरच्या परवानगीशिवाय अनधिकृत Repository किंवा Branch मध्ये बदल करू नयेत.

27. **Project Architecture आणि Coding Standards**

    Project मध्ये आधीपासून वापरली जाणारी Architecture, Folder Structure, Naming Conventions आणि Coding Patterns तपासून त्यांचे पालन करावे. नवीन Code लिहिताना विद्यमान पद्धतीशी सुसंगतता ठेवावी. कोणताही मोठा Architecture बदल किंवा संपूर्ण Folder Structure ची पुनर्रचना करण्यापूर्वी त्याची गरज तपासावी आणि मास्टर यांना माहिती द्यावी.

28. **Documentation आणि Code समजण्यास सुलभ ठेवणे**

    नवीन Feature किंवा महत्त्वाचा Logic तयार करताना आवश्यक तेथे स्पष्ट आणि संक्षिप्त Documentation द्यावे. Function, Component, API आणि महत्त्वाच्या प्रक्रियांची नावे त्यांच्या कामाशी संबंधित व समजण्यास सोपी असावीत. Code स्वतःच समजण्यासारखा ठेवावा आणि अनावश्यक Comments किंवा मोठे Documentation टाळावे.

29. **Error Handling आणि Debugging**

    Frontend आणि Backend मधील Errors योग्य प्रकारे हाताळावेत. कोणतीही समस्या आल्यास तिचे मूळ कारण शोधून दुरुस्ती करावी. फक्त Error Message लपवून किंवा तात्पुरता उपाय करून समस्या सोडवल्याचा दावा करू नये. Debugging करताना अनावश्यक Console Logs, Temporary Code आणि Debugging Statements अंतिम Code मधून काढून टाकावेत.

30. **कामाची व्याप्ती आणि अनावश्यक बदल टाळणे**

    मास्टर यांनी दिलेल्या कामाच्या उद्देशावर लक्ष केंद्रित करावे. संबंधित काम पूर्ण करण्यासाठी आवश्यक असलेल्या Files आणि Components मध्येच बदल करावेत. विनाकारण संपूर्ण Code पुन्हा लिहू नये, विद्यमान Design किंवा Functionality बदलू नये आणि असंबंधित Files मध्ये बदल करू नयेत. अतिरिक्त सुधारणा आवश्यक वाटल्यास त्या मास्टर यांना सुचवाव्यात.

31. **Accessibility आणि वापरण्यास सुलभता**

    प्रत्येक नवीन Feature आणि UI तयार करताना सर्व वापरकर्त्यांना ते सहज वापरता येईल याची काळजी घ्यावी. Buttons, Inputs, Forms आणि इतर Interactive Elements योग्य प्रकारे कार्यरत असावेत. आवश्यकतेनुसार Keyboard Navigation, Focus States, योग्य Labels, Semantic HTML आणि पुरेसा Color Contrast वापरावा. केवळ दिसायला चांगले UI न बनवता ते वापरण्यासही सोपे असावे.

32. **Browser Compatibility**

    नवीन Features आणि UI तयार करताना Project मध्ये समर्थित असलेल्या प्रमुख Browsers मध्ये ते योग्य प्रकारे कार्यरत राहतील याची काळजी घ्यावी. आधुनिक Browser Features वापरताना Compatibility तपासावी आणि आवश्यक असल्यास योग्य पर्यायी पद्धती वापराव्यात. एका Browser मधील बदलांमुळे इतर समर्थित Browsers मधील Functionality किंवा Design बिघडू देऊ नये.

33. **Database आणि Migration व्यवस्थापन**

    Database Models, Tables, Fields किंवा Relationships मध्ये बदल करण्यापूर्वी त्यांचा विद्यमान Data आणि संबंधित Functionality वर होणारा परिणाम तपासावा. आवश्यकतेनुसार योग्य Database Migration तयार करावी आणि ती सुरक्षितपणे लागू होईल याची खात्री करावी. विद्यमान Data विनाकारण Delete किंवा Modify करू नये. Backend आणि Frontend मधील Data Structure सुसंगत ठेवावी.

34. **API आणि Frontend-Backend सुसंगतता**

    Frontend आणि Backend यांच्यातील API Communication योग्य आणि सुसंगत ठेवावे. नवीन API तयार करण्यापूर्वी विद्यमान API तपासावेत. Request Methods, Parameters, Response Structure, Status Codes आणि Error Responses योग्य प्रकारे हाताळावेत. API मध्ये बदल करताना त्यावर अवलंबून असलेल्या सर्व Components आणि Features तपासाव्यात, जेणेकरून विद्यमान Functionality बिघडणार नाही.

35. **Authentication आणि Session व्यवस्थापन**

    Login, Logout, Registration, Token, Cookies, Session आणि User Permissions यांच्याशी संबंधित Code बदलण्यापूर्वी विद्यमान Authentication Flow पूर्णपणे समजून घ्यावा. नवीन बदलांमुळे इतर Applications, Subdomains किंवा Shared Authentication यंत्रणेवर परिणाम होणार नाही याची काळजी घ्यावी. संवेदनशील Authentication Data सुरक्षित ठेवावे आणि अनावश्यक Login किंवा API Requests टाळाव्यात.

36. **Shared Configuration आणि Environment Variables**

    Project मधील Environment Variables, Configuration Files आणि Shared Settings यांचा वापर योग्य प्रकारे करावा. नवीन Configuration जोडण्यापूर्वी विद्यमान Configuration तपासावे. संवेदनशील माहिती थेट Source Code मध्ये लिहू नये. Development, Testing आणि Production Environment मधील सेटिंग्ज योग्य प्रकारे वेगळ्या ठेवाव्यात. Configuration बदलताना त्यावर अवलंबून असलेल्या सर्व Applications तपासाव्यात.

37. **Build आणि Deployment सुरक्षितता**

    Project मध्ये Build, Deployment किंवा Production Configuration संबंधित बदल करण्यापूर्वी त्यांची विद्यमान कार्यपद्धती तपासावी. नवीन बदलांमुळे Build प्रक्रिया, चालू Applications, Domains, Subdomains किंवा Production Services प्रभावित होणार नाहीत याची काळजी घ्यावी. आवश्यक तपासण्या पूर्ण केल्याशिवाय Production मध्ये बदल लागू करू नयेत. Deployment दरम्यान समस्या उद्भवल्यास त्या योग्य प्रकारे दुरुस्त कराव्यात.

38. **Backup आणि Data Recovery**

    महत्त्वाच्या Files, Database किंवा User Data मध्ये मोठे बदल करण्यापूर्वी आवश्यकतेनुसार Backup आणि Recovery ची व्यवस्था तपासावी. Data Delete, Migration किंवा मोठ्या प्रमाणात Update करताना Data सुरक्षित राहील याची काळजी घ्यावी. चुकून Data गमावला जाण्याची शक्यता असल्यास आधी सुरक्षित पर्याय तयार करावा. Backup उपलब्ध नसताना धोकादायक बदल करू नयेत.

39. **User Experience आणि वापरकर्त्यांच्या कृती**

    प्रत्येक Feature तयार करताना वापरकर्ता ते कसे वापरेल, कोणत्या कृती करेल आणि त्याला कोणता प्रतिसाद मिळेल याचा विचार करावा. Buttons, Forms, Modals, Navigation आणि इतर Interactive Elements यांचे वर्तन स्पष्ट आणि अपेक्षेप्रमाणे असावे. एखादी कृती पूर्ण झाल्यावर योग्य Feedback द्यावा आणि अनावश्यक Steps किंवा गोंधळ निर्माण करणारी प्रक्रिया टाळावी.

40. **Authentication Repository मधील समस्या दुरुस्ती**

    Authentication संबंधित समस्या आढळल्यास Authentication Repository मधील Code तपासून समस्येचे मूळ कारण शोधावे. मात्र Authentication Repository मधील कोणतीही File, Code किंवा Configuration AI Agent ने बदलू नये. आवश्यक दुरुस्ती shivanyams Repository मध्येच करावी. तेथे दुरुस्ती शक्य नसल्यास मास्टर यांना समस्येचे कारण आणि आवश्यक बदल सुचवावेत.

41. **SDK, UI Components आणि CSS व्यवस्थापन**

    SDK Repository मधील उपलब्ध UI Components, त्यांची यादी, Code आणि कार्यपद्धती तपासून आवश्यकतेनुसार shivanyams Repository मध्ये त्यांचा पुनर्वापर करावा. नवीन UI तयार करण्यापूर्वी संबंधित SDK Component उपलब्ध आहे का हे तपासावे. User ज्या Feature, Page किंवा Field वर काम करत असेल, त्या ठिकाणी संबंधित SDK Component उपलब्ध आणि योग्य असल्यास त्याचाच वापर करावा. गरज नसताना नवीन किंवा Duplicate Component तयार करू नये.

    SDK Repository मधील कोणतीही File, Component, CSS किंवा Configuration AI Agent ने बदलू नये. SDK मध्ये बदल करण्याऐवजी आवश्यक Application-specific सुधारणा shivanyams Repository मध्ये कराव्यात. CSS Override आवश्यक असल्यास तेथेच योग्य Override करावा. SDK मध्ये आवश्यक बदल आढळल्यास त्याचे कारण मास्टर यांना सुचवावे. SDK मधील बदलांमुळे इतर Applications किंवा Components वर होणारा परिणाम तपासावा.

42. **Constants आणि Hardcoded Values व्यवस्थापन**

    Project मध्ये वारंवार वापरली जाणारी Values, Configuration, Labels, API Paths आणि इतर समान माहिती अनावश्यकपणे वेगवेगळ्या Files मध्ये Hardcode करू नये. नवीन Value जोडण्यापूर्वी विद्यमान Constants आणि Configuration तपासावे. पुन्हा वापरल्या जाणाऱ्या Values योग्य Shared File किंवा संबंधित Feature च्या Constants File मध्ये ठेवाव्यात. मात्र एकदाच वापरल्या जाणाऱ्या साध्या Values साठी अनावश्यक नवीन Files किंवा Abstractions तयार करू नयेत.

43. **Git Push साठी मास्टरची स्पष्ट परवानगी**

    कोणतेही Code Changes किंवा नवीन नियम तयार केल्यानंतर ते स्वतःहून Git मध्ये Commit किंवा Push करू नयेत. मास्टर यांनी स्पष्टपणे "shiv-v2 push" अशी सूचना दिल्यानंतरच adityathute/shivanyams Repository मधील shiv-v2 Branch वर मंजूर बदल Commit आणि Push करावेत. तोपर्यंत बदल तयार करून तपासावेत आणि मास्टर यांच्या पुढील सूचनेची वाट पाहावी. इतर Repository किंवा Branch वर Push करू नये.

44. **काम पूर्ण झाल्यानंतर अहवाल**

    प्रत्येक काम पूर्ण झाल्यानंतर मास्टर यांना थोडक्यात आणि स्पष्ट अहवाल द्यावा. त्यामध्ये कोणते बदल केले, कोणत्या Files मध्ये बदल केले, कोणते नवीन Components किंवा Features जोडले, कोणत्या समस्या दुरुस्त केल्या आणि कोणत्या चाचण्या केल्या याची माहिती द्यावी. काही काम अपूर्ण असल्यास किंवा अडचण असल्यास ती स्पष्टपणे सांगावी. प्रत्यक्षात न केलेल्या कामाचा किंवा चाचणीचा दावा करू नये.

45. **एकाच वेळी एकच काम पूर्ण करणे**

    मास्टर यांनी दिलेले प्रत्येक काम स्वतंत्रपणे पूर्ण करावे. सध्याचे काम पूर्ण होण्यापूर्वी दुसरे काम सुरू करू नये. एखाद्या कामासाठी आवश्यक माहिती किंवा परवानगी उपलब्ध नसल्यास अंदाजाने बदल करण्याऐवजी मास्टर यांना विचारावे. एक काम पूर्ण झाल्यानंतर त्याचा अहवाल देऊन पुढील सूचनेची वाट पाहावी.

46. **विद्यमान Components चे अनावश्यक पुनर्लेखन टाळणे**

    Project मध्ये आधीपासून कार्यरत असलेला Component किंवा Functionality बदलण्यापूर्वी त्याचा सध्याचा Code आणि वापर तपासावा. आवश्यक तेवढेच बदल करावेत. केवळ Code Style किंवा वैयक्तिक पसंतीमुळे पूर्ण Component पुन्हा लिहू नये. पुनर्लेखन आवश्यक असल्यास त्याचे कारण आणि विद्यमान Functionality वर होणारा परिणाम तपासावा.

47. **नवीन UI तयार करण्यापूर्वी विद्यमान UI तपासणे**

    नवीन UI Element, Component, Modal, Form, Button किंवा इतर Design तयार करण्यापूर्वी Project मधील विद्यमान UI Components आणि Design Patterns तपासावेत. संबंधित Component आधीपासून उपलब्ध असल्यास त्याचा योग्य पुनर्वापर करावा. उपलब्ध Component मध्ये आवश्यक सुधारणा शक्य असल्यास नवीन Duplicate Component तयार करू नये. नवीन Component तयार करणे आवश्यक असल्यास त्याची गरज स्पष्ट असावी.

48. **ChatGPT मधील ShivanyaMS V2 Project च्या सर्व संभाषणांमध्ये नियमांचे पालन**

    ChatGPT मधील shivanyams-v2 या Project अंतर्गत होणाऱ्या प्रत्येक नवीन आणि जुन्या संभाषणात AI Agent ने shivanyams Repository मधील AGENTS.md फाइलमधील MASTER ONLY विभागातील सर्व नियम वाचून त्यांचे पालन करावे. या Project मधील कोणतेही नवीन काम, Code Changes, Bug Fixes, UI Design, Feature Development किंवा Technical Discussion करताना हे नियम लागू राहतील. संभाषण नवीन असो किंवा आधीपासून सुरू असलेले असो, नियमांकडे दुर्लक्ष करू नये. नियमांमध्ये बदल करण्याचा अधिकार फक्त मास्टर यांच्याकडे राहील.

49. **काम सुरू करण्यापूर्वी Git मधील नवीनतम Code तपासणे**

    कोणतेही नवीन काम सुरू करण्यापूर्वी अधिकृत Repository आणि Branch मधील उपलब्ध नवीनतम Code तपासावा. मागील कामातील बदल, सध्याची Git स्थिती आणि संबंधित Files यांची खात्री करावी. आधीचे बदल गहाळ असतील किंवा स्थानिक आणि Remote Code मध्ये फरक असेल तर अंदाजाने काम सुरू करू नये. आवश्यक असल्यास मास्टर यांची परवानगी घ्यावी. मास्टर यांच्या परवानगीशिवाय विद्यमान बदल Overwrite किंवा Delete करू नयेत.

50. **Code मधील विद्यमान Patterns आणि Naming Convention पाळणे**

    नवीन Code, Components, Functions, Hooks, Variables किंवा Files तयार करताना Project मध्ये आधीपासून वापरल्या जाणाऱ्या Naming Conventions आणि Coding Patterns चे पालन करावे. एकाच प्रकारच्या Functionality साठी वेगवेगळी Naming Style वापरू नये. नवीन पद्धत सुरू करण्यापूर्वी तिची गरज तपासावी आणि विद्यमान Code शी सुसंगतता राखावी.

51. **प्रत्येक File च्या सुरुवातीला Location आणि Cleanup Status**

    नवीन File तयार करताना किंवा विद्यमान File संपादित करताना, त्या File च्या सुरुवातीला संबंधित भाषेच्या Comment Syntax मध्ये File Location म्हणजे Repository Root च्या नावासह पूर्ण Path (उदा. shivanyams/src/app/page.tsx), Reference Repositories, त्यांची तपासलेली Version/Branch माहिती, Cleanup Status आणि Cleanup Information नमूद करावी. Cleanup Status साठी Clean, Cleanup Pending किंवा Not Reviewed यापैकी योग्य स्थिती वापरावी. Legacy Code, Duplicate Code, अनावश्यक Imports, CSS किंवा इतर साफसफाई बाकी असल्यास त्याची थोडक्यात नोंद द्यावी. File पूर्णपणे तपासून स्वच्छ केल्यानंतरच Clean Status द्यावा. File संपादित करताना ही माहिती अद्ययावत करावी. JSON आणि Lock Files सारख्या Comment समर्थित नसलेल्या Files मध्ये Comments जबरदस्तीने जोडू नयेत; त्यांची माहिती स्वतंत्र Cleanup Report मध्ये ठेवावी. संपूर्ण Project मधील Files टप्प्याटप्प्याने तपासून Clean, Cleanup Pending आणि Not Reviewed Files ची यादी तयार करावी.


52. **Cleanup Progress Report**

    संपूर्ण Repository मधील Files ची Cleanup प्रक्रिया सुरू असताना प्रत्येक Batch पूर्ण झाल्यानंतर मास्टर यांना थोडक्यात Progress Report द्यावा. या Report मध्ये एकूण Files पैकी किती Files Clean आहेत, किती Cleanup Pending आहेत, किती Not Reviewed आहेत आणि अजून किती Files तपासणे बाकी आहेत हे स्पष्टपणे नमूद करावे. प्रत्येक नवीन Batch नंतर आधीच्या आकडेवारीनुसार एकूण संख्या अद्ययावत करावी. एखाद्या File ची स्थिती बदलल्यास त्यानुसार मोजणी दुरुस्त करावी. तपासणी न केलेल्या Files ना Clean समजू नये आणि प्रत्यक्ष तपासणीपेक्षा जास्त प्रगती झाल्याचा दावा करू नये. Report लहान, स्पष्ट आणि नियमित असावा.

53. **प्रत्येक File साठी UI, CSS आणि SDK Component Audit Report**

    नवीन File तयार करताना किंवा विद्यमान File संपादित करताना Rule 51 मधील Cleanup Info मध्ये त्या File चा प्रत्यक्ष तपासलेला UI आणि CSS Audit Report देखील द्यावा. TSX/JSX Files मध्ये वापरलेले UI Components, त्यांची नावे, एकूण संख्या, App-local किंवा Custom Components आणि SDK Components यांची स्वतंत्र नोंद करावी. CSS/SCSS Files मध्ये उपलब्ध HTML Element प्रकार आणि CSS Selectors (उदा. button, input, select, textarea, label, modal, card) यांची नावे व अचूक संख्या नमूद करावी. संबंधित TSX/JSX आणि CSS Files यांमधील Components व Selectors यांचे Mapping तपासावे; Duplicate Selectors, Duplicate UI, अनावश्यक Custom UI आणि Cleanup Pending बाबी नमूद कराव्यात.

    प्रत्येक UI Audit करण्यापूर्वी shivanya-sdk Repository मधील अधिकृत UI Component Inventory आणि आवश्यकतेनुसार संबंधित Component Implementation तपासावी. सध्याच्या कामाशी जुळणारे आणि प्रत्यक्ष वापरता येणारे SDK Components ओळखून त्यांची नावे नमूद करावीत. योग्य SDK Component उपलब्ध असल्यास shivanyams मध्ये त्याचा पुनर्वापर करावा; मात्र केवळ आकडेवारी पूर्ण करण्यासाठी Component जबरदस्तीने वापरू नये. SDK Repository मध्ये कोणताही बदल करू नये.

    Cleanup Info मध्ये किमान पुढील माहिती द्यावी: एकूण UI Components, SDK Components उपलब्ध/वापरलेले, App-local किंवा Custom Components, एकूण CSS Selectors व प्रकारनिहाय संख्या, Duplicate Items आणि Cleanup Pending Items. ज्या File मध्ये UI किंवा CSS लागू होत नाही, तेथे शून्य असल्याचे स्पष्ट नमूद करावे. CSS दुसऱ्या File मध्ये असल्यास त्याचा Path नमूद करावा आणि त्या CSS चे Selector Count प्रत्यक्ष तपासल्याशिवाय लिहू नये. अंदाजे किंवा न तपासलेली संख्या देऊ नये. File संपादित केल्यानंतर हा Report अद्ययावत करावा.

54. **Project Reports आणि Cleanup Master Register**

    Repository च्या Root मध्ये PROJECT_REPORTS.md ही कायमस्वरूपी Report File ठेवावी. त्यामध्ये Project/Repository चे नाव, GitHub Repository, सध्याची Branch आणि तपासलेला Commit, एकूण Tracked Files, तपासलेल्या Files, Clean, Cleanup Pending आणि Not Reviewed Files ची अचूक संख्या, तपासलेल्या Files ची यादी व Status, उर्वरित तपासणी आणि पुढील Cleanup काम नोंदवावे. Reference Repositories ची नावे, URL, तपासलेली Version/Branch/Commit, उपलब्ध Component Inventory आणि Version पडताळता न आल्यास त्याचे कारण नमूद करावे. प्रत्येक Cleanup Batch किंवा Reference Repository Update नंतर Report अद्ययावत करावा. आकडे Git Tree आणि प्रत्यक्ष तपासलेल्या Files शी जुळले पाहिजेत; अंदाजे आकडे वापरू नयेत.

55. **Reference Repository Version आणि Change Tracking**

    shivanya-sdk, shivanya-auth किंवा Project मध्ये वापरल्या जाणाऱ्या इतर Reference Repositories मध्ये नवीन Version, Commit, Component, Feature किंवा API जोडला/बदलला गेल्यास संबंधित Repository ची अधिकृत माहिती पुन्हा तपासावी. बदललेल्या Component/API शी संबंधित shivanyams Files ओळखून त्या Files मधील Reference Repositories नोंद, Component Audit, SDK Reuse Mapping आणि Cleanup Info अद्ययावत करावे. प्रत्येक लागू File मध्ये Reference Repository चे नाव आणि तपासलेली Version/Branch नमूद करावी. PROJECT_REPORTS.md मध्ये जुनी व नवीन Version/Commit, बदलाचा सारांश, परिणाम झालेल्या Files आणि Pending Actions नोंदवाव्यात. Private किंवा inaccessible Repository ची Version पडताळता येत नसेल तर तसे स्पष्ट लिहावे; अंदाजाने Version देऊ नये. Reference Repository read-only असल्यास त्यात बदल किंवा Commit करू नये.


56. **Project Reports आणि संपूर्ण Project Structure व्यवस्थापन**

    Repository च्या Root मध्ये PROJECT_REPORTS.md आणि PROJECT_STRUCTURE.md या दोन स्वतंत्र Files ठेवाव्यात. PROJECT_REPORTS.md मध्ये Project चे नाव व Version (V2), Repository/Branch, Package Version, तपासलेला Commit, एकूण Tracked Files, Clean, Cleanup Pending आणि Not Reviewed यांची अचूक मोजणी, Organized व Legacy Files ची संख्या, Reference Repositories आणि पुढील काम नोंदवावे. Commit History मध्ये फक्त शेवटचे तीन Commits आणि त्यांच्या महत्त्वाच्या बदलांचा संक्षिप्त सारांश ठेवावा. जुने Batch-wise तपशील, प्रत्येक Batch चे मोठे Tables किंवा जुना इतिहास PROJECT_REPORTS.md मध्ये पुन्हा पुन्हा जोडू नये; तीनपेक्षा जुने Commit तपशील काढून टाकावेत.

    PROJECT_STRUCTURE.md मध्ये Git Tree मधील प्रत्येक Tracked File ची स्वतंत्र नोंद असावी. प्रत्येक नोंदीत Repository Root पासूनचा पूर्ण Path, Cleanup Status (Clean, Cleanup Pending किंवा Not Reviewed) आणि Structure Status (Organized किंवा Legacy) नमूद करावा. एकूण Files, प्रत्येक Cleanup Status ची संख्या, Organized Files आणि Legacy Files यांची बेरीज Git Tree शी तंतोतंत जुळली पाहिजे. Generated Files, Comment न स्वीकारणाऱ्या Files आणि इतर अपवाद लपवू नयेत; योग्य Status देऊन स्पष्ट करावेत. नवीन File तयार झाल्यावर, File हलवल्यावर, हटवल्यावर किंवा Cleanup Status/Structure Status बदलल्यावर PROJECT_STRUCTURE.md अद्ययावत करावा.

    दोन्ही Reports प्रत्येक Cleanup Batch किंवा Structure Update नंतर अद्ययावत करावेत. PROJECT_REPORTS.md हा संक्षिप्त Summary आणि शेवटच्या तीन Commits चा Report असेल; PROJECT_STRUCTURE.md हा सर्व Files चा पूर्ण Master Register असेल. एकाच Batch चा तपशील दोन्ही Files मध्ये अनावश्यकपणे पुन्हा लिहू नये. संख्या प्रत्यक्ष Git Tree आणि तपासलेल्या Files वरूनच मोजावी; अंदाज, चुकीची एकूण संख्या किंवा न तपासलेल्या File ला Clean Status देऊ नये.

---

## AI ONLY — Instructions for AI agents

The following rules are for AI agents. The Master may edit them, and AI agents may improve or update this AI-only section when instructed by the Master or when necessary to bring it into line with the Master rules above. Never change the MASTER ONLY section without the Master's explicit instruction.

### Repository and branch scope

- Make code changes only in adityathute/shivanyams on branch shiv-v2, unless the Master explicitly changes this instruction.
- Treat shivanya-sdk and shivanya-auth as read-only reference repositories. Never write to, commit to, or push changes to either repository.
- Use the SDK and Authentication repositories only to inspect existing implementations, identify root causes, and reuse/reference available patterns. Apply permitted fixes in shivanyams; if a fix cannot safely be made there, explain the limitation and suggest the required change to the Master.
- Do not switch branches or modify other repositories unless explicitly authorized by the Master.

### FEATURES ONLY

- Look for small, genuinely useful feature improvements related to the task. Suggest them clearly; implement them when they fit the request, existing product direction, and available scope. Do not silently expand the task or add unrelated features.
- Build features in the organized feature/component structure. Prefer concise, readable code and existing shared components, hooks, utilities, and styles; avoid unnecessary files, abstractions, dependencies, and duplicate logic.
- Clean and organize both TSX/TS and CSS files as part of relevant frontend work. Inspect each file's role and dependencies first; move code to the correct organized location and remove legacy code only after confirming it is unused or safely replaced.
- Before creating UI, inspect the SDK's available UI component inventory and relevant component implementations. Reuse a suitable existing SDK component in shivanyams when it fits the feature, page, or field being worked on. Do not force component reuse where it does not fit, and do not modify the SDK repository.
- Keep CSS class names feature-scoped and distinctive. Do not define the same class selector repeatedly across files or create duplicate styles; reuse a class definition when appropriate. Do not force an artificial one-class-per-file structure.
- When a touched file still contains required legacy behavior, add at most one short status comment at the end of that file identifying that legacy behavior is still active and cleanup remains pending. Use the correct comment syntax for the file. Do not add status comments to files with no remaining legacy code, and remove or update the comment once the legacy code is fully cleaned.
- Before structural cleanup, inspect and plan the organized destination so existing behavior is preserved. After the change, summarize the final organized files and clearly identify any legacy code that remains; never claim cleanup is complete when it is not.

### Cleanup batch sizing

- Starting with Batch 12, target **10 files per cleanup batch**. A batch may contain fewer files when the remaining work is unusually complex, tightly coupled, or unsafe to split; do not exceed 10 files without the Master's explicit approval.
- Each batch must still include real file inspection and implementation where safely possible, Rule 51 file metadata, Rule 53 UI/CSS/SDK audits, and synchronized PROJECT_REPORTS.md / PROJECT_STRUCTURE.md updates when statuses or inventory change. Documentation-only work does not count as a completed code-cleanup batch.
- Group related files where practical. Do not mark a file Clean until its known cleanup and required verification are complete; preserve Cleanup Pending and Not Reviewed distinctions.
- Recalculate the remaining workload from the live Git tree and per-file statuses after each batch. Treat any projected batch count as an estimate, not a completion claim.

### Workflow for every task

1. Understand the request and inspect the existing implementation, related components, styles, utilities, routes, and data flow before making changes.
2. Reuse existing components, helpers, CSS classes, utilities, and established patterns where appropriate. Do not create duplicates.
3. Identify the smallest set of files required for the requested change and avoid unrelated edits.
4. If the Master asks for an explanation or confirmation before coding, explain the intended behavior and wait for approval.
5. Otherwise, implement the requested functionality directly. Do not replace implementation with documentation-only changes.
6. Preserve existing behavior and features unless the Master explicitly requests otherwise.
7. Review the final diff for correctness, duplication, unused code, accidental formatting changes, and unrelated edits.
8. Complete one requested task at a time, then wait for the Master's next instruction.

### Code organization and quality

- Put code in the correct existing feature, component, service, or style location.
- Follow the repository's architecture, naming conventions, formatting, and folder structure.
- Keep code concise, readable, maintainable, and efficient.
- Avoid unnecessary abstractions, dependencies, wrappers, comments, and extra lines of code.
- Prefer existing shared components, hooks, utilities, constants, and helpers when they fit.
- Extract shared logic only when it is genuinely reused; avoid both copy-paste and needless abstraction.
- Keep responsibilities clear and do not mix unrelated features in one component or stylesheet.

### CSS and responsive layout

- Inspect existing styles before adding or changing CSS.
- Reuse existing classes, design tokens, variables, and shared styles.
- Do not introduce duplicate selectors, repeated declarations, unnecessary overrides, or broad global selectors.
- Keep styling changes limited to the requested feature.
- Respect the existing parent/container dimensions. Child content must not overflow its available width or disrupt neighboring cards and layout.
- Base responsive behavior on the actual available container space and content where appropriate; do not assume viewport breakpoints alone solve every layout.
- Check narrow and wide layouts and account for long text, empty content, and wrapping.

### Safety and verification

- Do not remove or rewrite existing functionality unless explicitly requested.
- Check relevant imports, types, route paths, API contracts, responsive behavior, and loading, empty, and error states.
- Run appropriate checks when available. Report exactly what was and was not tested; never claim a build, test, or browser verification that did not happen.
- Do not invent implementation results, commit hashes, or successful checks.

### Git and delivery

- Commit completed changes only to adityathute/shivanyams on shiv-v2 when repository write access is available.
- Use a clear, specific commit message.
- After committing, provide the exact command the Master needs to pull the changes, normally git pull origin shiv-v2.
- State which files were changed and summarize the result briefly.
- Do not start the next task until the Master gives the next instruction.
