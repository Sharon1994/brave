������������õ��첽�ϴ��Ĳ��֣�����������ajaxupload.js���ģ�ʹ���������˼������⣬����������һ���Ǻ�̨����json����IEĬ�����ص����⡣
���ڰ��⼸�����⼰����취�ܽ����£�

ƽ̨��win8
����������Struts2��Spring��mybatis��Maven��Tomcat
�ϴ������ajaxFileUpload.js
���ֵ����⣺
1������ʱ����jQuery.handleError is not a function
2�������ϴ��ɹ�ʧ�ܣ�����ִ��error��������ִ��success����
3��IE ����Ĭ�����ط��ص�json��

���������
1����ajaxFileUpload.js�����handleError����
handleError : function(s, xhr, status, e) {
	// If a local callback was specified, fire it
	if (s.error) {
		s.error.call(s.context || s, xhr, status, e);
	}

	// Fire the global callback
	if (s.global) {
		(s.context ? jQuery(s.context) : jQuery.event).trigger("ajaxError", [ xhr, s, e ]);
	}
}

2����Firefox�¸��ٷ��֣���ִ�е� var data = jQuery.uploadHttpData(xml, s.dataType); ��һ��ʱ����������ִ�У�ֱ��ת����catch�
uploadHttpData �����Ǵ���ͷ����ɺ�̨�����������ݵģ�������3�ָ�ʽ��script��json��html������ǰ̨���� ajaxFileUpload ʱ����ָ��dataType��
���Ҵ���json���ݵķ�ʽҲ�����⣬����ҵ��������Դ��������޸ġ�

3����̨���ص�json����IE ��Ĭ�Ͻ�����Ϊ�ļ����ء������̨���õ� content-type �� application/json�������Ϊ��text/plain���󣬲���ͨ����

����Ҫ��4����̨����
response.setContentType("text/plain");